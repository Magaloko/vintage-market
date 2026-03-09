-- =============================================================================
-- Migration v9: Product Redesign
-- =============================================================================
-- Adds subcategory, quantity, shipping, hashtags, contact fields,
-- and linked product IDs for the 15-point product form redesign.
-- =============================================================================

-- 1. Subcategory
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. Quantity
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- 3. Shipping options (JSONB array of {id, price, note})
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping JSONB DEFAULT '[]'::jsonb;

-- 4. Hashtags (JSONB array of strings)
ALTER TABLE products ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb;

-- 5. Contact fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_telegram TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_instagram TEXT;

-- 6. Linked product IDs (JSONB array of UUIDs)
ALTER TABLE products ADD COLUMN IF NOT EXISTS linked_product_ids JSONB DEFAULT '[]'::jsonb;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_hashtags ON products USING GIN(hashtags);
