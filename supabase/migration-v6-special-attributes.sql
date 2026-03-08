-- ============================================
-- v6: Add special_attributes column to products
-- ============================================
-- Run in Supabase SQL Editor (safe to re-run)
-- Fixes: "Could not find the 'special_attributes' column"
-- ============================================

-- Add special_attributes as JSONB array (stores ["unique", "certified", ...])
ALTER TABLE products ADD COLUMN IF NOT EXISTS special_attributes JSONB DEFAULT '[]'::jsonb;
