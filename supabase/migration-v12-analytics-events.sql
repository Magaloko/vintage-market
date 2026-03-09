-- =============================================================================
-- Migration v12: Analytics Events — Real Website Tracking
-- =============================================================================
-- Event-Tabelle für echtes Benutzer-Tracking (Page Views, Klicks, etc.)
-- Wird von src/lib/analytics.js befüllt und von AdminAnalytics gelesen.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  pathname TEXT,
  product_id UUID,
  category TEXT,
  channel TEXT,
  metadata JSONB DEFAULT '{}',
  device_type TEXT,
  browser TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance-Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON public.analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session
  ON public.analytics_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_product
  ON public.analytics_events (product_id, event_type)
  WHERE product_id IS NOT NULL;

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anon darf Events schreiben (öffentliches Tracking ohne Login)
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events; EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Nur eingeloggte User (Admins) dürfen lesen
DO $$ BEGIN DROP POLICY IF EXISTS "Auth can read analytics events" ON public.analytics_events; EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "Auth can read analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (true);

-- Anon darf auch lesen (für Supabase-Client mit anon key im Admin-Panel)
DO $$ BEGIN DROP POLICY IF EXISTS "Anon can read analytics events" ON public.analytics_events; EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "Anon can read analytics events"
  ON public.analytics_events FOR SELECT
  TO anon
  USING (true);
