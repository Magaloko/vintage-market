-- ============================================
-- ЭПОХА — Vintage Marketplace Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'clothing',
  condition TEXT NOT NULL DEFAULT 'good',
  size TEXT,
  era TEXT,
  brand TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- 3. View counter function
CREATE OR REPLACE FUNCTION increment_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET views = views + 1 WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Public can view products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can delete
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- 5. Demo Data (optional — remove in production)
INSERT INTO products (title, description, price, category, condition, size, era, brand, image_url, status, views) VALUES
  ('Кожаный портфель 1960-х', 'Подлинный итальянский кожаный портфель из 1960-х годов. Великолепная патина, латунная фурнитура.', 320, 'accessories', 'vintage_character', NULL, '1960-е', 'Итальянское производство', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', 'active', 142),
  ('Шёлковое платье с цветочным принтом', 'Изящное шёлковое платье 1970-х годов с нежным цветочным принтом. Длина миди, пояс на талии.', 180, 'clothing', 'excellent', 'M', '1970-е', NULL, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop', 'active', 89),
  ('Настольная лампа Art Deco', 'Латунная настольная лампа в стиле Ар-Деко. Оригинальный абажур из молочного стекла.', 450, 'furniture', 'excellent', NULL, '1930-е', NULL, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop', 'active', 203),
  ('Механические часы Полёт', 'Советские механические часы «Полёт» 1970-х годов. Позолоченный корпус, оригинальный ремешок.', 250, 'accessories', 'good', NULL, '1970-е', 'Полёт', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', 'active', 315),
  ('Фарфоровая ваза Мейсен', 'Коллекционная фарфоровая ваза Meissen с ручной росписью. Кобальтовый синий фон.', 680, 'collectibles', 'excellent', NULL, '1920-е', 'Meissen', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=600&fit=crop', 'active', 178);
