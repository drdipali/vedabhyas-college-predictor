-- ==============================================================================
-- Vedabhyas College Predictor - Supabase Database Schema
-- Run this script in your Supabase project's SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Create EXTENSIONS (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. CREATE TABLE: colleges (The live, approved colleges displayed to students)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    city TEXT,
    state TEXT NOT NULL,
    college_type TEXT NOT NULL DEFAULT 'Government',   -- 'Government', 'Govt-Aided', 'Private', 'Deemed'
    quota_type TEXT NOT NULL DEFAULT 'AIQ',          -- 'All India Quota (AIQ)', 'State Quota', 'Deemed / Management', 'National Institute'
    departments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of branches/departments offered
    annual_fee TEXT,                                 -- Approved annual tuition fee (e.g. '₹2,50,000 / year')
    monthly_stipend TEXT,                            -- Approved monthly stipend (e.g. '₹55,000 / month')
    last_year_closing_rank JSONB DEFAULT '{"UR": 3000, "OBC": 3500, "SC": 5000, "ST": 6000, "EWS": 3300}'::jsonb,
    source_url TEXT,                                 -- Official website or counseling portal link
    ncism_code TEXT,                                 -- Ministry of Ayush / NCISM college code
    is_verified BOOLEAN NOT NULL DEFAULT false,      -- Marked true when approved by Super Admin
    verified_at TIMESTAMPTZ,
    verified_by TEXT,                                -- Person or admin who verified
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy state and type searches
CREATE INDEX IF NOT EXISTS idx_colleges_state ON public.colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_is_verified ON public.colleges(is_verified);

-- ------------------------------------------------------------------------------
-- 3. CREATE TABLE: college_submissions (Pending updates from College Administrators)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.college_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    college_name TEXT NOT NULL,
    ncism_code TEXT,
    state TEXT NOT NULL,
    college_type TEXT NOT NULL,                      -- 'Government', 'Govt-Aided', 'Private', 'Deemed'
    quota_type TEXT NOT NULL,                        -- 'All India Quota (AIQ)', 'State Quota', 'Deemed / Management'
    departments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of MD/MS departments
    annual_fee TEXT,                                 -- Proposed annual fee
    monthly_stipend TEXT,                            -- Proposed monthly stipend
    contact_person_name TEXT NOT NULL,               -- Mandatory for verification call
    designation TEXT NOT NULL,                       -- e.g. 'Principal', 'Dean', 'PG In-Charge'
    contact_phone TEXT NOT NULL,                     -- 10-digit mobile number to call
    official_email TEXT NOT NULL,                    -- Official institutional email
    proof_url TEXT,                                  -- Link to seat matrix / gazette notification / brochure
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,                                -- Faculty verification notes
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for submission queues
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.college_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.college_submissions(submitted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.college_submissions(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_submissions ENABLE ROW LEVEL SECURITY;

-- 4.1 Colleges Table RLS:
-- Anyone (students, anonymous, faculty) can read live approved colleges
DROP POLICY IF EXISTS "Public can view approved colleges" ON public.colleges;
CREATE POLICY "Public can view approved colleges"
    ON public.colleges
    FOR SELECT
    USING (true);

-- Only Super Admin or service role can insert/update/delete live colleges
-- (Replace 'dipalichaudhari929@gmail.com' with your Super Admin email)
DROP POLICY IF EXISTS "Super admin can manage colleges" ON public.colleges;
CREATE POLICY "Super admin can manage colleges"
    ON public.colleges
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- 4.2 College Submissions Table RLS:
-- College Admins can insert their own submissions
DROP POLICY IF EXISTS "College admins can submit updates" ON public.college_submissions;
CREATE POLICY "College admins can submit updates"
    ON public.college_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = submitted_by_user_id 
        OR submitted_by_user_id IS NULL
    );

-- College Admins can view their own submissions; Super Admin can view all
DROP POLICY IF EXISTS "Users view own or admin views all submissions" ON public.college_submissions;
CREATE POLICY "Users view own or admin views all submissions"
    ON public.college_submissions
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = submitted_by_user_id
        OR auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- Only Super Admin can update submission status (Approve / Reject) or edit typos
DROP POLICY IF EXISTS "Super admin can update submissions" ON public.college_submissions;
CREATE POLICY "Super admin can update submissions"
    ON public.college_submissions
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- ------------------------------------------------------------------------------
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_colleges_updated_at ON public.colleges;
CREATE TRIGGER set_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_college_submissions_updated_at ON public.college_submissions;
CREATE TRIGGER set_college_submissions_updated_at
    BEFORE UPDATE ON public.college_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Schema creation complete!
-- ==============================================================================
