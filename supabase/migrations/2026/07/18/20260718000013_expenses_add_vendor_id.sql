-- Migration: event_expenses — add vendor_id (link a cost to a CRM vendor)
-- =============================================================================
-- Change C: money correlates to a vendor by id. A vendor's spend is DERIVED from
-- its linked expenses (live sum), never stored on the vendor. ON DELETE SET NULL
-- so deleting a vendor unlinks its expenses but keeps them — the free-text
-- vendor_name (snapshotted by the FE when a vendor is picked) remains as the
-- label, exactly the "fallback for un-linked expenses" the design intends.
-- =============================================================================

ALTER TABLE public.event_expenses
  ADD COLUMN IF NOT EXISTS vendor_id uuid
    REFERENCES public.event_vendors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS event_expenses_vendor_id_idx
  ON public.event_expenses (vendor_id);

-- Rollback:
--   DROP INDEX public.event_expenses_vendor_id_idx;
--   ALTER TABLE public.event_expenses DROP COLUMN vendor_id;
