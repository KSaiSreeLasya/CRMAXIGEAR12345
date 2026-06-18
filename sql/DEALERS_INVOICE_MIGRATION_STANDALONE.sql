-- ============================================================================
-- DEALERS INVOICE MIGRATION - STANDALONE VERSION
-- ============================================================================
-- Purpose: Add per-product GST and new invoice metadata fields
-- Date: 2026-01-15
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- STEP 1: Add New Columns to dealer_invoices Table
-- ============================================================================
-- These columns store the new invoice metadata fields
-- Run this first if your table already exists

ALTER TABLE dealer_invoices 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS po_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS sent_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS ship_to VARCHAR(255);

-- ============================================================================
-- STEP 2: Create Indexes for Performance
-- ============================================================================
-- Improves query performance for filtering/sorting on new columns

CREATE INDEX IF NOT EXISTS idx_dealer_invoices_due_date ON dealer_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_po_number ON dealer_invoices(po_number);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_created_at ON dealer_invoices(created_at);

-- ============================================================================
-- STEP 3: Create/Update Timestamp Trigger
-- ============================================================================
-- Automatically updates the updated_at column when records are modified

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

-- ============================================================================
-- STEP 4: Ensure Row Level Security (RLS) is Configured
-- ============================================================================
-- Uncomment if you want to enable RLS (if not already enabled)

-- ALTER TABLE dealer_invoices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create or Update RLS Policies
-- ============================================================================
-- Uncomment if you want to configure RLS policies

-- DROP POLICY IF EXISTS "Enable read for authenticated users" ON dealer_invoices;
-- CREATE POLICY "Enable read for authenticated users" ON dealer_invoices
--   FOR SELECT
--   USING (true);

-- DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dealer_invoices;
-- CREATE POLICY "Enable insert for authenticated users" ON dealer_invoices
--   FOR INSERT
--   WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable update for authenticated users" ON dealer_invoices;
-- CREATE POLICY "Enable update for authenticated users" ON dealer_invoices
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable delete for authenticated users" ON dealer_invoices;
-- CREATE POLICY "Enable delete for authenticated users" ON dealer_invoices
--   FOR DELETE
--   USING (true);

-- ============================================================================
-- STEP 6: Create Summary View (Optional)
-- ============================================================================
-- Provides analytics on dealer invoices by dealer name

CREATE OR REPLACE VIEW dealer_invoice_summary AS
SELECT 
  dealer_name,
  COUNT(*) as total_invoices,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_invoice_amount,
  MAX(invoice_date) as latest_invoice_date,
  MIN(invoice_date) as first_invoice_date
FROM dealer_invoices
GROUP BY dealer_name
ORDER BY total_revenue DESC;

-- ============================================================================
-- VERIFICATION QUERIES (Optional)
-- ============================================================================
-- Run these to verify the migration was successful

-- Check if new columns exist:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'dealer_invoices' 
-- AND column_name IN ('due_date', 'po_number', 'sent_to', 'ship_to');

-- Check if indexes were created:
-- SELECT indexname 
-- FROM pg_indexes 
-- WHERE tablename = 'dealer_invoices' 
-- AND indexname LIKE 'idx_dealer%';

-- Check trigger:
-- SELECT trigger_name 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'dealer_invoices';

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================
-- Uncomment to insert a sample invoice with new fields

-- INSERT INTO dealer_invoices (
--   id,
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
--   mode_of_payment,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'DLR/2026-27/001',
--   '2026-01-15',
--   '2026-02-15',
--   'PO-12345',
--   'ABC Dealers',
--   '9876543210',
--   'Hyderabad',
--   'John Doe',
--   'XYZ Company Building, Mumbai',
--   '[
--     {
--       "id": "prod_1",
--       "product": "Battery Pack",
--       "productDescription": "48V 100Ah LiFePO4",
--       "amount": 50000,
--       "unit": 1,
--       "gstRate": 18
--     },
--     {
--       "id": "prod_2",
--       "product": "Charger",
--       "productDescription": "Fast Charging Unit",
--       "amount": 5000,
--       "unit": 2,
--       "gstRate": 5
--     }
--   ]'::jsonb,
--   1000,
--   60000,
--   9500,
--   70500,
--   true,
--   'Bank Transfer',
--   CURRENT_TIMESTAMP,
--   CURRENT_TIMESTAMP
-- );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All schema changes have been applied successfully.
-- The dealer_invoices table now supports:
-- - Per-product GST selection (5% or 18%)
-- - Additional invoice metadata fields (due_date, po_number, sent_to, ship_to)
-- ============================================================================
