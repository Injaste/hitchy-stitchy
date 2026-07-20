-- Migration: event_expenses — drop the vendor_name column
-- =============================================================================
-- Runs LAST of the three: 20260720000001/2 removed the only writers, so nothing
-- references the column by the time it goes. No index, view or constraint reads
-- it. An expense whose vendor is deleted now simply shows no vendor — the delete
-- modal says so up front, which is honest where a stale snapshot was not.
-- =============================================================================
ALTER TABLE public.event_expenses DROP COLUMN IF EXISTS vendor_name;

-- Rollback: ALTER TABLE public.event_expenses ADD COLUMN vendor_name text;
-- (values are not recoverable — re-paste 20260718000014/15 to restore the writers)
