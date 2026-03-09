-- =============================================================================
-- Migration v13: Agent Workspace — Performance Indexes
-- =============================================================================
-- Die Spalten assigned_to und priority existieren bereits seit v7.
-- Hier nur Indexes für Agent-Workspace-Queries.
-- =============================================================================

-- Index für Agent-Filter: "Meine Tickets" + "Unzugewiesene"
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned
  ON public.inquiries (assigned_to);

-- Index für Priorität-Sortierung
CREATE INDEX IF NOT EXISTS idx_inquiries_priority
  ON public.inquiries (priority);

-- Composite für Agent-Workspace: Status + Zuweisung
CREATE INDEX IF NOT EXISTS idx_inquiries_status_assigned
  ON public.inquiries (status, assigned_to);
