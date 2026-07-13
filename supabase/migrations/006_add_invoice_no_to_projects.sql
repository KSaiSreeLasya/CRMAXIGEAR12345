ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS invoice_no TEXT;
