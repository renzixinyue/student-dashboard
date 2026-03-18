
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_id INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  present INTEGER DEFAULT 0,
  absent INTEGER DEFAULT 0,
  late INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  action TEXT NOT NULL,
  score_change INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow public read/write since auth is handled by backend or minimal)
-- Ideally, we should restrict this, but for this demo/dashboard, we can start with open access for anon/service_role
CREATE POLICY "Enable all access for anon and service_role" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon and service_role" ON logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon and service_role" ON sessions FOR ALL USING (true) WITH CHECK (true);
