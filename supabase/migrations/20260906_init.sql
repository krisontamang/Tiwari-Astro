-- Migration: Initial Schema for Astro Tiwari (Submissions, Users, Consultations)
-- Project Ref: vrgraptxhfxlitmywyde
-- Generated for Tiwari-Astro

-- 1. Create Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    gender TEXT,
    dob_bs TEXT,
    dob_ad TEXT,
    birth_time TEXT,
    birth_period TEXT,
    birth_place TEXT,
    package TEXT,
    amount NUMERIC DEFAULT 0,
    message TEXT,
    rectification TEXT,
    payment_screenshot_url TEXT,
    kundali_photo_url TEXT,
    chart_svg_url TEXT,
    circle_svg_url TEXT,
    kundali_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Consultation Chats Table
CREATE TABLE IF NOT EXISTS public.consultation_chats (
    id TEXT PRIMARY KEY,
    submission_id TEXT REFERENCES public.submissions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_phone ON public.submissions(phone);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_consultation_chats_sub_id ON public.consultation_chats(submission_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_chats ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Anon & Service Roles
-- Submissions: Allow public insert, public read (for order lookup), service full access
CREATE POLICY "Allow public insert to submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select from submissions"
    ON public.submissions FOR SELECT
    USING (true);

CREATE POLICY "Allow public update to submissions"
    ON public.submissions FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete from submissions"
    ON public.submissions FOR DELETE
    USING (true);

-- Users: Allow select, insert, update
CREATE POLICY "Allow anon read users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert users"
    ON public.users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anon update users"
    ON public.users FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Consultation Chats: Allow insert and select
CREATE POLICY "Allow anon select chats"
    ON public.consultation_chats FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert chats"
    ON public.consultation_chats FOR INSERT
    WITH CHECK (true);
