-- ============================================
-- Galerie du Temps v5.0 — Migration: Multi-Vendor
-- ============================================
-- Run AFTER migration-v4-inquiries.sql

-- 1. Profiles table (role management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',  -- admin, seller, user
  shop_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert profile" ON profiles FOR INSERT WITH CHECK (true);

-- 2. Shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  opening_hours TEXT DEFAULT '',
  logo_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active',  -- active, suspended, pending
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_user ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Anyone can view active shops
CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
-- Owners can update their shop
CREATE POLICY "Owners can update shop" ON shops FOR UPDATE USING (auth.uid() = user_id);
-- Authenticated users can create shops
CREATE POLICY "Auth users can create shops" ON shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Add shop_id to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);

-- 4. Shop reviews
CREATE TABLE IF NOT EXISTS shop_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop ON shop_reviews(shop_id);

ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON shop_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create reviews" ON shop_reviews FOR INSERT WITH CHECK (true);

-- 5. Update products RLS to allow shop owners to manage their products
-- Drop old policies if they exist (safe to fail)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Shop owners can manage products" ON products;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Shop owners can manage products" ON products
  FOR ALL TO authenticated
  USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Link profiles to shops
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS fk_profiles_shop
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL;

-- 7. Function to update shop rating after review
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM shop_reviews WHERE shop_id = NEW.shop_id),
    review_count = (SELECT COUNT(*) FROM shop_reviews WHERE shop_id = NEW.shop_id)
  WHERE id = NEW.shop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_shop_rating ON shop_reviews;
CREATE TRIGGER trg_update_shop_rating
  AFTER INSERT OR UPDATE OR DELETE ON shop_reviews
  FOR EACH ROW EXECUTE FUNCTION update_shop_rating();
