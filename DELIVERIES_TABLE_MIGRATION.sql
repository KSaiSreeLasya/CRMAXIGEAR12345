CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS delivery_date DATE;

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS project_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deliveries_project_id_fkey'
      AND conrelid = 'public.deliveries'::regclass
  ) THEN
    ALTER TABLE public.deliveries
      ADD CONSTRAINT deliveries_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date
  ON public.deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status
  ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_project_id
  ON public.deliveries(project_id);

CREATE OR REPLACE FUNCTION public.create_delivery_for_project()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_date IS NOT NULL THEN
    INSERT INTO public.deliveries (
      project_id,
      project_name,
      deliverables,
      delivery_date,
      status,
      user_id
    ) VALUES (
      NEW.id,
      NEW.customer_name,
      NEW.product_description,
      NEW.delivery_date,
      'pending',
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_delivery_after_project_insert ON public.projects;
CREATE TRIGGER create_delivery_after_project_insert
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_delivery_for_project();

DROP VIEW IF EXISTS public.upcoming_deliveries_7_days;
CREATE VIEW public.upcoming_deliveries_7_days AS
SELECT
  d.*,
  p.customer_name,
  p.contact_no,
  p.location,
  p.amount
FROM public.deliveries d
JOIN public.projects p ON p.id = d.project_id
WHERE d.status = 'pending'
  AND d.delivery_date >= CURRENT_DATE
  AND d.delivery_date <= CURRENT_DATE + 7
ORDER BY d.delivery_date ASC;
