ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'regular';

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_sale_type_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_sale_type_check
  CHECK (sale_type IN ('regular', 'b2b'));
