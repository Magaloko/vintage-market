-- ============================================
-- Galerie du Temps — COMPLETE SAFE MIGRATION
-- ============================================
-- This handles ALL v3-v5 changes in one go.
-- Safe to run multiple times (all IF NOT EXISTS).
-- Run this ONCE in Supabase SQL Editor.
-- ============================================

-- =====================
-- 1. PRODUCTS UPDATES
-- =====================

-- Add details JSONB column (v3)
ALTER TABLE products ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_products_details ON products USING GIN (details);

-- Add shop_id column (v5)
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN shop_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add shop_id index
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);


-- =====================
-- 2. INQUIRIES TABLE
-- =====================

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  product_id UUID,
  product_title TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop old policies safely, then recreate
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can create inquiries" ON inquiries; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view inquiries" ON inquiries; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update inquiries" ON inquiries; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete inquiries" ON inquiries; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anyone can create inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view inquiries" ON inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update inquiries" ON inquiries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete inquiries" ON inquiries FOR DELETE TO authenticated USING (true);


-- =====================
-- 3. SHOPS TABLE
-- =====================

CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  opening_hours TEXT DEFAULT '',
  logo_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique slug (safe)
DO $$ BEGIN
  ALTER TABLE shops ADD CONSTRAINT shops_slug_key UNIQUE (slug);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_user ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view active shops" ON shops; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owners can update shop" ON shops; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Auth users can create shops" ON shops; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Owners can update shop" ON shops FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth users can create shops" ON shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


-- =====================
-- 4. PROFILES TABLE
-- =====================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  shop_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Users can read own profile" ON profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can update own profile" ON profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can insert profile" ON profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert profile" ON profiles FOR INSERT WITH CHECK (true);


-- =====================
-- 5. SHOP REVIEWS
-- =====================

CREATE TABLE IF NOT EXISTS shop_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop ON shop_reviews(shop_id);

ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view reviews" ON shop_reviews; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can create reviews" ON shop_reviews; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anyone can view reviews" ON shop_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create reviews" ON shop_reviews FOR INSERT WITH CHECK (true);


-- =====================
-- 6. FOREIGN KEYS (safe)
-- =====================

-- products.shop_id -> shops.id
DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT fk_products_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- inquiries.product_id -> products.id
DO $$ BEGIN
  ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- shop_reviews.shop_id -> shops.id
DO $$ BEGIN
  ALTER TABLE shop_reviews ADD CONSTRAINT fk_reviews_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =====================
-- 7. AUTO RATING TRIGGER
-- =====================

CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_shop_id UUID;
BEGIN
  target_shop_id := COALESCE(NEW.shop_id, OLD.shop_id);
  UPDATE shops SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM shop_reviews WHERE shop_id = target_shop_id), 0),
    review_count = (SELECT COUNT(*) FROM shop_reviews WHERE shop_id = target_shop_id)
  WHERE id = target_shop_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_shop_rating ON shop_reviews;
CREATE TRIGGER trg_update_shop_rating
  AFTER INSERT OR UPDATE OR DELETE ON shop_reviews
  FOR EACH ROW EXECUTE FUNCTION update_shop_rating();


-- =====================
-- DONE!
-- =====================
-- Tables created/updated: products, inquiries, shops, profiles, shop_reviews
-- All safe to re-run.
