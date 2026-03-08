-- =============================================================================
-- Migration v7: Obzor — Ticket Lifecycle System
-- =============================================================================
-- Extends inquiries table with lifecycle columns.
-- Adds inquiry_notes and inquiry_status_log tables.
-- =============================================================================

-- New columns on inquiries
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Migrate legacy statuses
UPDATE inquiries SET status = 'open' WHERE status = 'read';
UPDATE inquiries SET status = 'solved' WHERE status = 'replied';

-- ─── Internal notes ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquiry_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'admin',
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON inquiry_notes(inquiry_id);

ALTER TABLE inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes"
  ON inquiry_notes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── Status change log ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquiry_status_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'admin',
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_log_inquiry ON inquiry_status_log(inquiry_id);

ALTER TABLE inquiry_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage status log"
  ON inquiry_status_log FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
