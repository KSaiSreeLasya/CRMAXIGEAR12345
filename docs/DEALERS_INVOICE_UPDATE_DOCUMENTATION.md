# Dealers Invoice Update - Documentation

## Overview
This update adds the following features to the Dealers Invoice system:

1. **Per-Product GST Selection**: Allow dealers to select GST rate (5% or 18%) for each product
2. **Invoice Metadata Fields**: Added new fields to capture additional invoice information:
   - Due Date
   - P.O.# (Purchase Order Number)
   - Sent To (recipient contact person)
   - Ship To (shipping address)

## Database Schema Changes

### New/Updated Fields in `dealer_invoices` table

```sql
-- New columns to add to the dealer_invoices table
- due_date: DATE - Payment due date
- po_number: VARCHAR(100) - Purchase order reference number
- sent_to: VARCHAR(255) - Name/contact of recipient
- ship_to: VARCHAR(255) - Shipping address
- products: JSONB - Changed from simple array to support per-product GST
```

### Product JSONB Structure
Each product in the products JSONB array now includes:
```json
{
  "id": "string",
  "product": "string",
  "productDescription": "string",
  "amount": "number",
  "unit": "number",
  "gstRate": "number" // 5 or 18
}
```

## Frontend Changes

### Updated Interfaces
- **ProductRow**: Added `gstRate: number` field
- **DealerInvoiceRecord**: Added new fields for due date, PO number, sent to, ship to
- **InvoiceForm**: Updated to include all new fields

### UI Updates
1. **Product Form**:
   - Added GST rate selector dropdown (5% or 18%) for each product
   - Displayed in product row alongside amount and unit fields

2. **Invoice Metadata Form**:
   - Due Date field (date picker)
   - P.O.# field (text input)
   - Sent To field (text input)
   - Ship To field (text input)

3. **Invoice Preview/PDF**:
   - Displays Due Date and P.O.# in invoice header
   - Shows Sent To and Ship To in the Bill To section
   - Product table includes GST% column showing per-product GST rate

### Calculation Logic
- **Per-Product GST**: Each product is taxed at its selected rate (5% or 18%)
- **Labour Charges**: Taxed at 18% (default)
- **Total GST**: Sum of all product GST + labour GST
- **Total Amount**: Subtotal + Labour + Total GST

## SQL Migration Script

Run the following SQL to update your database:

```sql
-- 1. Add new columns to dealer_invoices table
ALTER TABLE dealer_invoices 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS po_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS sent_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS ship_to VARCHAR(255);

-- 2. Create indexes for faster queries on new fields
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_due_date ON dealer_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_po_number ON dealer_invoices(po_number);

-- 3. Update existing products column to JSONB format (if needed)
-- Note: Only run this if products column exists but is not JSONB
-- ALTER TABLE dealer_invoices 
-- ALTER COLUMN products TYPE JSONB USING products::jsonb;

-- 4. Create or update the updated_at trigger
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
```

## Example Invoice Record (JSON Structure)

```json
{
  "id": "dealer_inv_1234567890",
  "dealerInvoiceNo": "DLR/2026-27/001",
  "dealerName": "ABC Dealers",
  "contactNo": "9876543210",
  "location": "Hyderabad",
  "invoiceDate": "2026-01-15",
  "dueDate": "2026-02-15",
  "poNumber": "PO-12345",
  "sentTo": "John Doe",
  "shipTo": "XYZ Company, Plot 123, Mumbai",
  "products": [
    {
      "id": "product_1",
      "product": "Battery Pack",
      "productDescription": "48V 100Ah LiFePO4",
      "amount": 50000,
      "unit": 1,
      "gstRate": 18
    },
    {
      "id": "product_2",
      "product": "Charger",
      "productDescription": "Fast Charger Unit",
      "amount": 5000,
      "unit": 2,
      "gstRate": 5
    }
  ],
  "labourCharges": 1000,
  "total": 68700,
  "gstEnabled": true,
  "gstAmount": 8700,
  "modeOfPayment": "Bank Transfer",
  "leadSource": "Direct",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

## How to Use

### Creating an Invoice with GST Per Product:

1. **Enter Basic Information**:
   - Invoice Number (auto-generated)
   - Dealer Name
   - Contact No, Location
   - Invoice Date
   - Due Date (automatically set to 30 days from invoice date)
   - P.O.# (optional)
   - Sent To (optional)
   - Ship To (optional)

2. **Add Products**:
   - Product Name
   - Description
   - Unit (quantity)
   - Amount (price per unit)
   - **GST Rate** - Select 5% or 18%

3. **Review Summary**:
   - System calculates per-product GST based on selected rates
   - Shows total GST, taxable value, and final amount

4. **Save Invoice**:
   - Data is saved to localStorage and Supabase
   - Can be previewed, exported, or converted to PDF

### Viewing Invoice with New Fields:

When you preview or generate PDF:
- Due Date appears in invoice header
- P.O.# appears in invoice header
- Sent To and Ship To appear in the Bill To section
- Products table shows the GST% applied to each product

## Backward Compatibility

- Existing invoices without new fields will continue to work
- New fields are optional (all have default/null values)
- If products don't have gstRate specified, 18% is applied by default
- Existing invoices can be edited to add new field values

## Files Modified

1. **client/pages/DealerInvoice.tsx**
   - Updated interfaces
   - Updated form to include new fields
   - Updated GST calculation logic
   - Added product GST rate selector

2. **client/components/DealerInvoiceContent.tsx**
   - Updated invoice display to show new fields
   - Updated invoice header with Due Date and P.O.#
   - Updated Bill To section with Sent To and Ship To
   - Updated products table with GST% column
   - Updated GST calculation per product

3. **SQL Files**
   - `sql/UPDATE_DEALERS_INVOICE_SCHEMA.sql` - Complete migration script

## Testing

After implementation, test the following:

1. ✅ Create new invoice with GST 5% product
2. ✅ Create new invoice with GST 18% product
3. ✅ Mix products with different GST rates
4. ✅ Verify GST calculation is correct
5. ✅ Fill in all new fields (Due Date, P.O.#, Sent To, Ship To)
6. ✅ Preview invoice showing all new fields
7. ✅ Generate PDF with all new information
8. ✅ Edit existing invoice and add new field values
9. ✅ Export/Import invoices with new fields
10. ✅ Verify localStorage persistence

## Support

For questions or issues regarding the update, refer to:
- `docs/DEALERS_INVOICE_SCHEMA.sql` - Original schema documentation
- `client/pages/DealerInvoice.tsx` - Implementation details
- `client/components/DealerInvoiceContent.tsx` - Display and calculation logic
