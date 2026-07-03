-- event_tutorial: persist the MINIMISED (collapsed-to-pill) state per member, so the
-- widget stays minimised across reloads and devices instead of springing back open.
-- Mirrors dismissed_by/celebrated_by: a jsonb array of the event_members.id values
-- that have minimised the guide. A member sees the full panel unless their id is in
-- the array. Minimise is a lighter, reversible sibling of dismissal — hide the panel
-- but keep the pill; expanding again removes the id. Additive, defaults to empty.

ALTER TABLE public.event_tutorial
  ADD COLUMN IF NOT EXISTS minimised_by jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Rollback:
--   ALTER TABLE public.event_tutorial DROP COLUMN IF EXISTS minimised_by;
