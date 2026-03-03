-- ============================================
-- Galerie du Temps v4.0 — Migration: Inquiries
-- ============================================
-- Run this in Supabase SQL Editor AFTER migration-v3

-- 1. Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT,
  status TEXT NOT NULL DEFAULT 'new',  -- new, read, replied, closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_product ON inquiries(product_id);

-- 2. RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an inquiry (no auth required)
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can view inquiries
CREATE POLICY "Admins can view inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update status
CREATE POLICY "Admins can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can delete
CREATE POLICY "Admins can delete inquiries"
  ON inquiries FOR DELETE
  TO authenticated
  USING (true);
