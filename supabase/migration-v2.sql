-- ============================================
-- ЭПОХА v2.0 — Migration: Images + Favorites
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- AFTER the initial schema.sql

-- ─────────────────────────────────────────────
-- 1. Product Images Table (Gallery)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,           -- path in Supabase Storage (null for external URLs)
  position INTEGER DEFAULT 0,  -- order in gallery (0 = main image)
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id, position);

-- RLS for product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);


-- ─────────────────────────────────────────────
-- 2. Favorites Table
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,       -- references auth.users(id)
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_id);

-- RLS for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view only their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add to their own favorites
CREATE POLICY "Users can add own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 3. Favorites count function
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_favorites_count(p_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM favorites WHERE product_id = p_id;
$$ LANGUAGE sql STABLE;


-- ─────────────────────────────────────────────
-- 4. Supabase Storage Bucket
-- ─────────────────────────────────────────────
-- Run these in the Supabase Dashboard → Storage → New Bucket
-- OR use the SQL below:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Anyone can view product images in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');


-- ─────────────────────────────────────────────
-- 5. Migrate existing image_url to product_images
-- ─────────────────────────────────────────────
-- This copies existing single image_url into the new gallery table

INSERT INTO product_images (product_id, url, position, alt_text)
SELECT id, image_url, 0, title
FROM products
WHERE image_url IS NOT NULL AND image_url != '';


-- ─────────────────────────────────────────────
-- 6. Add demo images to existing products
-- ─────────────────────────────────────────────
-- Extra gallery images for demo products (runs after step 5)

-- Additional images for Кожаный портфель
INSERT INTO product_images (product_id, url, position, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', 1, 'Портфель — вид сбоку'
FROM products WHERE title LIKE '%портфель%' LIMIT 1;

INSERT INTO product_images (product_id, url, position, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop', 2, 'Портфель — детали'
FROM products WHERE title LIKE '%портфель%' LIMIT 1;

-- Additional images for Настольная лампа
INSERT INTO product_images (product_id, url, position, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop', 1, 'Лампа — при свете'
FROM products WHERE title LIKE '%лампа%' LIMIT 1;

-- Additional images for часы Полёт
INSERT INTO product_images (product_id, url, position, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&h=600&fit=crop', 1, 'Часы — циферблат'
FROM products WHERE title LIKE '%часы%' LIMIT 1;

INSERT INTO product_images (product_id, url, position, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop', 2, 'Часы — на руке'
FROM products WHERE title LIKE '%часы%' LIMIT 1;
