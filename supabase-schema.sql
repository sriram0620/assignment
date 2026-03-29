-- ============================================================
--  AI-HRMS  –  Supabase Schema
--  Run this ONCE in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  industry    TEXT DEFAULT '',
  plan        TEXT DEFAULT 'free',
  wallet_address TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HRMS Users  (custom auth, NOT Supabase Auth)
CREATE TABLE IF NOT EXISTS hrms_users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,         -- bcrypt hash
  role          TEXT NOT NULL DEFAULT 'employee',
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  wallet_address TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hrms_users_email   ON hrms_users(email);
CREATE INDEX IF NOT EXISTS idx_hrms_users_org_id  ON hrms_users(org_id);

-- 3. Departments
CREATE TABLE IF NOT EXISTS departments (
  id       TEXT PRIMARY KEY,
  org_id   TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  parent_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_departments_org_id ON departments(org_id);

-- 4. Global Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
  id       TEXT PRIMARY KEY,
  name     TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'technical'
);

-- Seed default skills (idempotent)
INSERT INTO skills (id, name, category) VALUES
  ('sk-01', 'React',          'technical'),
  ('sk-02', 'TypeScript',     'technical'),
  ('sk-03', 'Node.js',        'technical'),
  ('sk-04', 'PostgreSQL',     'technical'),
  ('sk-05', 'Solidity',       'technical'),
  ('sk-06', 'Python',         'technical'),
  ('sk-07', 'Docker',         'technical'),
  ('sk-08', 'AWS',            'technical'),
  ('sk-09', 'GraphQL',        'technical'),
  ('sk-10', 'REST APIs',      'technical'),
  ('sk-11', 'System Design',  'technical'),
  ('sk-12', 'Communication',  'soft'),
  ('sk-13', 'Leadership',     'soft'),
  ('sk-14', 'Agile',          'domain')
ON CONFLICT (name) DO NOTHING;

-- 5. Employees
CREATE TABLE IF NOT EXISTS employees (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         TEXT REFERENCES hrms_users(id) ON DELETE SET NULL,
  department_id   TEXT REFERENCES departments(id) ON DELETE SET NULL,
  department_name TEXT,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'employee',
  wallet_address  TEXT,
  job_title       TEXT NOT NULL,
  hire_date       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  skills          JSONB DEFAULT '[]',   -- Array of {skill_id, skill_name, proficiency}
  tasks_assigned  INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employees_org_id  ON employees(org_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

-- 6. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      TEXT NOT NULL,
  created_by_name TEXT,
  assigned_to     TEXT,
  assigned_to_name TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  priority        TEXT NOT NULL DEFAULT 'medium',
  status          TEXT NOT NULL DEFAULT 'pending',
  deadline        TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  tx_hash         TEXT,
  block_number    BIGINT,
  ai_assigned     BOOLEAN DEFAULT FALSE,
  required_skills JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id     ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);

-- 7. On-chain Events
CREATE TABLE IF NOT EXISTS onchain_events (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  org_id           TEXT NOT NULL,
  task_id          TEXT,
  employee_address TEXT,
  completed_at_unix BIGINT,
  priority         INTEGER,
  tx_hash          TEXT UNIQUE,
  block_number     BIGINT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_onchain_events_org_id ON onchain_events(org_id);

-- ============================================================
-- 8. Security hardening: Row Level Security (RLS)
--    Prevent direct anon-key reads/writes outside API layer.
-- ============================================================

-- Enable RLS on all application tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onchain_events ENABLE ROW LEVEL SECURITY;

-- Revoke broad table access from anon/authenticated roles.
-- The app uses service-role key on server routes.
REVOKE ALL ON TABLE organizations FROM anon, authenticated;
REVOKE ALL ON TABLE hrms_users FROM anon, authenticated;
REVOKE ALL ON TABLE departments FROM anon, authenticated;
REVOKE ALL ON TABLE skills FROM anon, authenticated;
REVOKE ALL ON TABLE employees FROM anon, authenticated;
REVOKE ALL ON TABLE tasks FROM anon, authenticated;
REVOKE ALL ON TABLE onchain_events FROM anon, authenticated;

-- Drop/recreate policies for idempotent reruns
DROP POLICY IF EXISTS service_role_organizations_all ON organizations;
DROP POLICY IF EXISTS service_role_hrms_users_all ON hrms_users;
DROP POLICY IF EXISTS service_role_departments_all ON departments;
DROP POLICY IF EXISTS service_role_skills_all ON skills;
DROP POLICY IF EXISTS service_role_employees_all ON employees;
DROP POLICY IF EXISTS service_role_tasks_all ON tasks;
DROP POLICY IF EXISTS service_role_onchain_events_all ON onchain_events;

-- Allow full access only to service_role (backend)
CREATE POLICY service_role_organizations_all ON organizations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_hrms_users_all ON hrms_users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_departments_all ON departments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_skills_all ON skills
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_employees_all ON employees
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_tasks_all ON tasks
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_onchain_events_all ON onchain_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
--  DONE — your schema is ready.
--  Restart your Next.js dev server and test /api/auth/register
-- ============================================================
