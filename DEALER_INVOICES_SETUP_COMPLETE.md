# Dealer Invoices Supabase Setup - Complete Guide

## Status: ✅ Almost Complete

All application code has been updated to work with your Supabase schema. You need to execute ONE more SQL migration.

---

## What's Been Done

### ✅ Application Code Updates
- Fixed table names: `dealer_invoices` → `dealers_invoices`
- Updated invoice data loading to transform snake_case to camelCase
- Added support for fetching related invoice items
- Properly maps all form fields to Supabase columns

### ✅ Tables Already Created in Supabase
1. **dealers_invoices** - Main invoice table ✓
2. **dealers_invoice_items** - Line items table ✓

---

## Final Step: Add GST Enabled Column

Execute this SQL in your Supabase dashboard to add the missing `gst_enabled` column:

### In Supabase SQL Editor:

```sql
ALTER TABLE public.dealers_invoices 
ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.dealers_invoices.gst_enabled IS 'Flag to indicate if GST is calculated and applied to this invoice';
```

### How to Execute:
1. Open https://supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New query**
5. Paste the SQL above
6. Click **Run**

---

## Verification Checklist

After executing the SQL, verify everything is set up:

1. ✅ Open `/dealer-invoice` page
2. ✅ Fill in the form:
   - Invoice Number (auto-filled)
   - Dealer Name
   - Contact, Location, Dates
   - Add some products with different GST rates
3. ✅ Click **Create Invoice**
4. ✅ Check Supabase:
   - Go to **Table Editor**
   - Look in `dealers_invoices` table - your invoice should appear
   - Look in `dealers_invoice_items` table - your products should appear

---

## Supabase Schema Overview

### dealers_invoices Table Columns
- `id` (UUID) - Primary key
- `invoice_number` (VARCHAR) - Invoice number (e.g., DLR/2026-27/001)
- `invoice_date` (DATE) - Invoice date
- `due_date` (DATE) - Payment due date
- `dealer_name` (VARCHAR) - Dealer name
- `contact_no` (VARCHAR) - Contact number
- `location` (VARCHAR) - Location
- `purchase_order_no` (VARCHAR) - PO number
- `sent_to` (VARCHAR) - Sent to person
- `ship_to` (TEXT) - Shipping address
- `mode_of_payment` (VARCHAR) - Cash, Cheque, etc.
- `lead_source` (VARCHAR) - How they were sourced
- `labour_charges` (NUMERIC) - Labour charges
- `subtotal` (NUMERIC) - Subtotal before tax
- `gst_enabled` (BOOLEAN) - Whether GST is applied
- `total_gst_amount` (NUMERIC) - Total GST calculated
- `total_amount` (NUMERIC) - Final amount with GST
- `payment_status` (VARCHAR) - pending, paid, partial
- `created_at` (TIMESTAMP) - Auto-generated
- `updated_at` (TIMESTAMP) - Auto-updated

### dealers_invoice_items Table Columns
- `id` (VARCHAR) - Primary key
- `invoice_id` (UUID) - Foreign key to dealers_invoices
- `product_name` (VARCHAR) - Product name
- `product_description` (TEXT) - Description
- `quantity` (INTEGER) - Quantity ordered
- `unit_price` (NUMERIC) - Price per unit
- `line_total` (NUMERIC) - Quantity × Price
- `gst_rate` (NUMERIC) - GST rate (5 or 18)
- `gst_amount` (NUMERIC) - GST calculated on line
- `line_amount_with_gst` (NUMERIC) - Line total + GST
- `created_at` (TIMESTAMP) - Auto-generated
- `updated_at` (TIMESTAMP) - Auto-updated

---

## Features Now Working

✅ **Create Invoice** - Save new invoices to Supabase
✅ **Edit Invoice** - Update existing invoices
✅ **Delete Invoice** - Remove invoices from Supabase
✅ **View Saved Invoices** - Load and display all invoices
✅ **Product Line Items** - Save individual products with different GST rates
✅ **Download PDF** - Generate and download invoice PDFs with embedded logo
✅ **LocalStorage Fallback** - Data saves locally if Supabase connection fails

---

## Troubleshooting

### If invoices don't save:
1. Check browser console for errors
2. Verify the `dealers_invoices` table exists in Supabase
3. Verify the `dealers_invoice_items` table exists
4. Check that RLS policies are enabled and set to allow all access

### If old data doesn't show:
1. Clear browser cache or use an incognito window
2. Check localStorage is empty (F12 → Application → Storage)
3. Data should load from Supabase first, then localStorage as fallback

### If PDFs don't show logo:
- This was fixed in a previous update - logo is now embedded as base64

---

## Questions?

All configuration files and migrations are saved in the `/sql` folder for reference.
