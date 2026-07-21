-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  phone_no TEXT NOT NULL,
  remark1 TEXT,
  remark2 TEXT,
  remark3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_customer_name ON public.leads(customer_name);
CREATE INDEX IF NOT EXISTS idx_leads_phone_no ON public.leads(phone_no);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads"
  ON public.leads
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
  ON public.leads
  FOR DELETE
  USING (user_id = auth.uid());
