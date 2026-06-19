-- Add gst_enabled column to dealers_invoices table
ALTER TABLE public.dealers_invoices 
ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN DEFAULT true;

-- Create comment for clarity
COMMENT ON COLUMN public.dealers_invoices.gst_enabled IS 'Flag to indicate if GST is calculated and applied to this invoice';
