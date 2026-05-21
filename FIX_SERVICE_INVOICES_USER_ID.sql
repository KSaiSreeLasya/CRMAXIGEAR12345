-- Drop the old foreign key constraint and change user_id type
ALTER TABLE service_invoices DROP CONSTRAINT IF EXISTS service_invoices_user_id_fkey;

-- Change user_id from UUID to VARCHAR to support both Supabase auth UUIDs and employee session IDs
ALTER TABLE service_invoices ALTER COLUMN user_id TYPE VARCHAR(255);

-- Remove the NOT NULL constraint temporarily if needed, then add it back
ALTER TABLE service_invoices ALTER COLUMN user_id SET NOT NULL;

-- Disable RLS to allow employee-based access
ALTER TABLE service_invoices DISABLE ROW LEVEL SECURITY;

-- Ensure permissions are set
GRANT SELECT, INSERT, UPDATE, DELETE ON service_invoices TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
