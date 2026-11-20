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

-- ------------------------------------------------------------------------------
-- 6. CREATE TABLE: student_profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    aiapget_rank INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    domicile_state TEXT NOT NULL DEFAULT 'Maharashtra',
    mobile_number TEXT,
    bams_college TEXT,
    target_specialty TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_rank ON public.student_profiles(aiapget_rank);

-- ------------------------------------------------------------------------------
-- 7. CREATE TABLE: student_college_suggestions (Crowdsourced Missing Colleges)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_college_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_code TEXT NOT NULL UNIQUE,                -- e.g. 'AYU0014', uppercase trimmed
    college_name TEXT NOT NULL,
    state TEXT NOT NULL,
    college_type TEXT NOT NULL DEFAULT 'Government', -- 'Government', 'Govt-Aided', 'Private', 'Deemed'
    quota_type TEXT NOT NULL DEFAULT 'State Quota',  -- 'All India Quota (AIQ)', 'State Quota', 'Deemed / Management'
    branches JSONB NOT NULL DEFAULT '[]'::jsonb,     -- Array of departments/branches
    submitted_by_user_ids UUID[] NOT NULL DEFAULT '{}'::uuid[], -- List of student user IDs who submitted/confirmed
    verification_count INTEGER NOT NULL DEFAULT 1,    -- Incremented when multiple students request the same college
    submitted_payloads JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array storing each student's submission metadata for cross-checking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_suggestions_code ON public.student_college_suggestions(college_code);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.student_college_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_verification_count ON public.student_college_suggestions(verification_count DESC);

-- ------------------------------------------------------------------------------
-- 8. CREATE TABLE: student_preferences (Ordered Counselling Choice List)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    college_id TEXT,                                 -- Nullable, links to live public.colleges(id)
    suggestion_id UUID REFERENCES public.student_college_suggestions(id) ON DELETE SET NULL, -- Nullable, links to crowdsourced suggestions
    branch TEXT NOT NULL,
    priority_order INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON public.student_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_priority ON public.student_preferences(user_id, priority_order ASC);
CREATE INDEX IF NOT EXISTS idx_preferences_college_id ON public.student_preferences(college_id);
CREATE INDEX IF NOT EXISTS idx_preferences_suggestion_id ON public.student_preferences(suggestion_id);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_college_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;

-- 9.1 student_profiles RLS:
DROP POLICY IF EXISTS "Students manage own profile" ON public.student_profiles;
CREATE POLICY "Students manage own profile"
    ON public.student_profiles
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- 9.2 student_preferences RLS:
DROP POLICY IF EXISTS "Students manage own preferences" ON public.student_preferences;
CREATE POLICY "Students manage own preferences"
    ON public.student_preferences
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- 9.3 student_college_suggestions RLS:
-- Public / authenticated students can view all suggestions to check existing college codes
DROP POLICY IF EXISTS "Anyone can view college suggestions" ON public.student_college_suggestions;
CREATE POLICY "Anyone can view college suggestions"
    ON public.student_college_suggestions
    FOR SELECT
    USING (true);

-- Authenticated students can insert new suggestions
DROP POLICY IF EXISTS "Students can insert suggestions" ON public.student_college_suggestions;
CREATE POLICY "Students can insert suggestions"
    ON public.student_college_suggestions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Students can confirm/increment suggestions; Super Admin can edit & approve/reject
DROP POLICY IF EXISTS "Users update or super admin manages suggestions" ON public.student_college_suggestions;
CREATE POLICY "Users update or super admin manages suggestions"
    ON public.student_college_suggestions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (
        -- If status is changing, must be super admin
        (status IS NOT DISTINCT FROM status)
        OR auth.jwt() ->> 'email' IN ('dipalichaudhari929@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    );

-- ------------------------------------------------------------------------------
-- 10. UPDATE TRIGGERS FOR NEW TABLES
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER set_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_suggestions_updated_at ON public.student_college_suggestions;
CREATE TRIGGER set_suggestions_updated_at
    BEFORE UPDATE ON public.student_college_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_preferences_updated_at ON public.student_preferences;
CREATE TRIGGER set_preferences_updated_at
    BEFORE UPDATE ON public.student_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Schema creation complete!
-- ==============================================================================
