-- ============================================
-- FIX MODE OF PAYMENT CONSTRAINT
-- ============================================
-- This migration updates the mode_of_payment check constraint
-- to include all payment methods: Cash, Card, UPI, Cheque, Bajaj, NEFT, Other

-- ============================================
-- 1. DROP EXISTING CONSTRAINTS
-- ============================================
ALTER TABLE IF EXISTS public.projects
DROP CONSTRAINT IF EXISTS projects_mode_of_payment_check;

ALTER TABLE IF EXISTS public.estimations
DROP CONSTRAINT IF EXISTS estimations_mode_of_payment_check;

ALTER TABLE IF EXISTS public.service_invoices
DROP CONSTRAINT IF EXISTS service_invoices_mode_of_payment_check;

ALTER TABLE IF EXISTS public.invoices
DROP CONSTRAINT IF EXISTS invoices_mode_of_payment_check;

-- ============================================
-- 2. ADD UPDATED CONSTRAINTS WITH ALL PAYMENT MODES
-- ============================================
ALTER TABLE IF EXISTS public.projects
ADD CONSTRAINT projects_mode_of_payment_check 
CHECK (mode_of_payment IN ('Cash', 'Card', 'UPI', 'Cheque', 'Bajaj', 'NEFT', 'Other'));

ALTER TABLE IF EXISTS public.estimations
ADD CONSTRAINT estimations_mode_of_payment_check 
CHECK (mode_of_payment IN ('Cash', 'Card', 'UPI', 'Cheque', 'Bajaj', 'NEFT', 'Other'));

ALTER TABLE IF EXISTS public.service_invoices
ADD CONSTRAINT service_invoices_mode_of_payment_check 
CHECK (mode_of_payment IN ('Cash', 'Card', 'UPI', 'Cheque', 'Bajaj', 'NEFT', 'Other'));

ALTER TABLE IF EXISTS public.invoices
ADD CONSTRAINT invoices_mode_of_payment_check 
CHECK (mode_of_payment IN ('Cash', 'Card', 'UPI', 'Cheque', 'Bajaj', 'NEFT', 'Other'));
