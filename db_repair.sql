-- TRANSPASYS DATABASE REPAIR SCRIPT
-- Copy and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Repair 'users' table (Adds missing columns for Address, Contact, and Verification)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS purok TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- 2. Repair 'budgets' table (Adds file attachment and description support)
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Repair 'events' table (Adds attendance management)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_participants INTEGER;

-- 4. Repair 'announcements' table (Adds scheduling support)
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 5. Data Synchronization
-- Mark any accounts without a verification status as verified (for existing test accounts)
UPDATE public.users SET email_verified = true WHERE email_verified IS NULL;

-- 6. Refresh Schema Cache
-- This ensures the PostgREST API immediately sees the new columns
NOTIFY pgrst, 'reload schema';
