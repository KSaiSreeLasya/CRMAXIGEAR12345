-- Migration: Add GST per product and additional invoice fields to dealer_invoices
-- Date: 2026-01-15
-- Purpose: Support per-product GST selection (5% or 18%) and add invoice metadata fields

-- 1. Alter dealer_invoices table to add new fields
-- Note: If the table doesn't exist, create it first

-- Check if dealer_invoices table exists, if not create it
CREATE TABLE IF NOT EXISTS dealer_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Invoice Details
  dealer_invoice_no VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE,
  due_date DATE,
  po_number VARCHAR(100),
  
  -- Dealer Information
  dealer_name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(20),
  location VARCHAR(255),
  
  -- Shipping Information
  sent_to VARCHAR(255),
  ship_to VARCHAR(255),
  
  -- Products (stored as JSONB to support per-product GST)
  products JSONB, -- Format: [{ id, product, productDescription, amount, unit, gst_rate }, ...]
  
  -- Financial Summary
  labour_charges DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2),
  total_gst DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment Information
  gst_enabled BOOLEAN DEFAULT true,
  mode_of_payment VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add new columns to existing dealer_invoices table (if upgrading)
-- Uncomment and run these if the table already exists
--
-- ALTER TABLE dealer_invoices 
-- ADD COLUMN IF NOT EXISTS due_date DATE,
-- ADD COLUMN IF NOT EXISTS sent_to VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS ship_to VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);
--
-- -- Modify products column to JSONB if it's currently TEXT
-- ALTER TABLE dealer_invoices 
-- ALTER COLUMN products TYPE JSONB USING products::jsonb;

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_invoice_no ON dealer_invoices(dealer_invoice_no);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_invoice_date ON dealer_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_dealer_name ON dealer_invoices(dealer_name);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_due_date ON dealer_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_created_at ON dealer_invoices(created_at);

-- 4. Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_dealer_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealer_invoices_updated_at ON dealer_invoices;
CREATE TRIGGER dealer_invoices_updated_at
BEFORE UPDATE ON dealer_invoices
FOR EACH ROW
EXECUTE FUNCTION update_dealer_invoices_timestamp();

-- 5. Enable Row Level Security (RLS) if needed
ALTER TABLE dealer_invoices ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DROP POLICY IF EXISTS "Enable read for authenticated users" ON dealer_invoices;
CREATE POLICY "Enable read for authenticated users" ON dealer_invoices
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dealer_invoices;
CREATE POLICY "Enable insert for authenticated users" ON dealer_invoices
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON dealer_invoices;
CREATE POLICY "Enable update for authenticated users" ON dealer_invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON dealer_invoices;
CREATE POLICY "Enable delete for authenticated users" ON dealer_invoices
  FOR DELETE
  USING (true);

-- 6. Create a view for summary statistics by dealer
CREATE OR REPLACE VIEW dealer_invoice_summary AS
SELECT 
  dealer_name,
  COUNT(*) as total_invoices,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_invoice,
  MAX(invoice_date) as latest_invoice_date
FROM dealer_invoices
GROUP BY dealer_name
ORDER BY total_revenue DESC;

-- Example: Insert a sample record with new schema
-- INSERT INTO dealer_invoices (
--   dealer_invoice_no,
--   invoice_date,
--   due_date,
--   po_number,
--   dealer_name,
--   contact_no,
--   location,
--   sent_to,
--   ship_to,
--   products,
--   labour_charges,
--   subtotal,
--   total_gst,
--   total_amount,
--   gst_enabled,
--   mode_of_payment
-- ) VALUES (
--   'DLR/2026-27/001',
--   '2026-01-15',
--   '2026-02-15',
--   'PO-12345',
--   'ABC Dealers',
--   '9876543210',
--   'Hyderabad',
--   'John Doe',
--   'XYZ Company',
--   '[
--     {
--       "product": "Battery Pack",
--       "productDescription": "48V 100Ah",
--       "amount": 50000,
--       "unit": 1,
--       "gst_rate": 18
--     },
--     {
--       "product": "Charger",
--       "productDescription": "Fast Charger",
--       "amount": 5000,
--       "unit": 2,
--       "gst_rate": 5
--     }
--   ]'::jsonb,
--   0,
--   60000,
--   8700,
--   68700,
--   true,
--   'Bank Transfer'
-- );
