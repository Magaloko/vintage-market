-- =============================================================================
-- Migration v8: Era Year Range
-- =============================================================================
-- Replaces the free-text `era` column with `era_start` and `era_end` integers.
-- =============================================================================

-- 1. Add new columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS era_start INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS era_end INTEGER;

-- 2. Migrate existing era text data to numeric ranges
-- Known patterns: '1920-е', '1930-е', '1950-е', '1960-е', '1970-е', '1980-е'
UPDATE products SET
  era_start = CAST(LEFT(era, 4) AS INTEGER),
  era_end   = CAST(LEFT(era, 4) AS INTEGER) + 9
WHERE era IS NOT NULL
  AND era ~ '^\d{4}';

-- 3. Drop the old column
ALTER TABLE products DROP COLUMN IF EXISTS era;

-- 4. Index for range queries
CREATE INDEX IF NOT EXISTS idx_products_era_range ON products(era_start, era_end);
