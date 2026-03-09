-- =============================================================================
-- Migration v10: Zendesk-Inspired Features
-- =============================================================================
-- Adds CSAT (customer satisfaction), SLA tracking, and first reply timestamp
-- to the inquiries table for Zendesk-style ticket analytics.
-- =============================================================================

-- 1. CSAT — Customer Satisfaction
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS csat_rating INTEGER CHECK (csat_rating BETWEEN 1 AND 5);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS csat_comment TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS csat_at TIMESTAMPTZ;

-- 2. SLA tracking
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS first_reply_at TIMESTAMPTZ;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS sla_first_reply_hours NUMERIC(6,2);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS sla_resolution_hours NUMERIC(6,2);
