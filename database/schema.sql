-- Health Guardian AI - Database Schema (Plain PostgreSQL)
-- Run this once against a fresh Postgres database:
--   psql -U postgres -d health_guardian -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (auth) — replaces Supabase's built-in auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  blood_type text,
  allergies text[],
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  date_of_birth date,
  gender text,
  blood_type text,
  allergies text[],
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- MEDICINES
-- ============================================================
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_member_id uuid REFERENCES family_members(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text,
  times text[],
  start_date date,
  end_date date,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- MEDICINE REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS medicine_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  scheduled_time time,
  taken boolean DEFAULT false,
  taken_at timestamptz,
  date date,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_member_id uuid REFERENCES family_members(id) ON DELETE CASCADE,
  image_url text,
  doctor_name text,
  diagnosis text,
  notes text,
  prescribed_date date,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- HEALTH CHECKUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS health_checkups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_member_id uuid REFERENCES family_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  checkup_type text,
  facility text,
  scheduled_date date,
  reminder_days_before int DEFAULT 1,
  notes text,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- CHAT HISTORY (AI Chatbot)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  is_user boolean,
  created_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_user ON medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_family_member ON medicines(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reminders_medicine ON medicine_reminders(medicine_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkups_user ON health_checkups(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
