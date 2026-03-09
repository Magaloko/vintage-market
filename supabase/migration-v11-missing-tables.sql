-- =============================================================================
-- Migration v11: Fehlende Tabellen + RPC + Storage
-- =============================================================================
-- Erstellt alle Tabellen, die im Code referenziert aber noch nicht
-- in früheren Migrations angelegt wurden.
-- Sicher mehrfach ausführbar (IF NOT EXISTS überall).
-- =============================================================================


-- =====================
-- 1. FAVORITES
-- =====================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(user_id, product_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Users can view own favorites" ON favorites; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can add favorites" ON favorites; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can remove favorites" ON favorites; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

DO $$ BEGIN
  ALTER TABLE favorites ADD CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =====================
-- 2. PRODUCT IMAGES
-- =====================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view product images" ON product_images; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Auth can manage product images" ON product_images; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Auth can manage product images" ON product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER TABLE product_images ADD CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =====================
-- 3. PRODUCT REVIEWS
-- =====================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  screenshot_url TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view product reviews" ON product_reviews; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can create product reviews" ON product_reviews; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anyone can view product reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create product reviews" ON product_reviews FOR INSERT WITH CHECK (true);

DO $$ BEGIN
  ALTER TABLE product_reviews ADD CONSTRAINT fk_product_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =====================
-- 4. PRICE HISTORY
-- =====================

CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view price history" ON price_history; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Auth can manage price history" ON price_history; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anyone can view price history" ON price_history FOR SELECT USING (true);
CREATE POLICY "Auth can manage price history" ON price_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER TABLE price_history ADD CONSTRAINT fk_price_history_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =====================
-- 5. USER CONTACTS
-- =====================

CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller', 'agent')),
  contact_whatsapp TEXT,
  contact_telegram TEXT,
  contact_instagram TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "Anon can read user_contacts" ON user_contacts; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Auth can read user_contacts" ON user_contacts; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Auth can manage user_contacts" ON user_contacts; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Anon can read user_contacts" ON user_contacts FOR SELECT TO anon USING (true);
CREATE POLICY "Auth can read user_contacts" ON user_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can manage user_contacts" ON user_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- =====================
-- 6. RPC: increment_views
-- =====================

CREATE OR REPLACE FUNCTION increment_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================
-- 7. products.is_promoted (falls fehlend)
-- =====================

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;


-- =====================
-- DONE!
-- =====================
-- Tabellen: favorites, product_images, product_reviews, price_history, user_contacts
-- RPC: increment_views
-- Spalte: products.is_promoted
-- Alle sicher wiederholbar (IF NOT EXISTS).
