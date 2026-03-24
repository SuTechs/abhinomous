-- ═══════════════════════════════════════════════════════════
-- Supabase Schema for The Introverted Blog
-- Run this in Supabase SQL Editor to set up the database.
-- ═══════════════════════════════════════════════════════════

-- 1. Categories lookup table
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, slug) VALUES
  ('Philosophy', 'philosophy'),
  ('Book Review', 'book-review'),
  ('Travel', 'travel'),
  ('Personal', 'personal')
ON CONFLICT (slug) DO NOTHING;

-- 2. Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Personal',
  image_url TEXT,
  read_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update `updated_at` on row change
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 3. Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view blogs)
CREATE POLICY "Public can read blogs"
  ON blogs FOR SELECT
  USING (true);

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

-- Only authenticated users (admin) can insert/update/delete
CREATE POLICY "Admin can insert blogs"
  ON blogs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update blogs"
  ON blogs FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete blogs"
  ON blogs FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. Index for performance
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
