-- Migration: Vendor CRM — rebuild event_vendors as a couple-side directory
-- =============================================================================
-- The original event_vendors was dropped unbuilt by 20260605000002. This is a
-- fresh table, not a restore: the columns are defined here for the first time.
--
-- A vendor is a CONTACT CARD, not a money row. Cost/deposit/balance are
-- deliberately absent — money lives in Budget and will correlate through a
-- vendor_id on event_expenses (a later, separate migration, since that one has
-- to touch the live expense RPCs). A vendor's spend is therefore derived from
-- its linked expenses, never copied onto the row, so there's nothing to sync.
--
-- No created_by: this is a super-admin-only table, so the creator is always the
-- couple — the same reasoning that dropped it from event_gifts (20260613000004)
-- and event_expenses (20260613000005).
--
-- Scope note: vendors is NOT yet in the event_resources catalog and has no plan
-- feature. Reads/writes gate on the super-admin bypass alone (as budget and
-- gifts do), and the frontend gates on RequireAccess + isSuperAdmin. Wiring it
-- up as a real Resource + plan feature is a follow-up — hence no
-- assert_plan(...) calls below yet.

-- 1) Table ---------------------------------------------------------------------
-- event_id is denormalised onto the row so RLS can gate it directly, matching
-- every other child table. touch_updated_at attaches itself via the
-- auto_attach_triggers_on_create event trigger — no manual trigger here.
CREATE TABLE public.event_vendors (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id      uuid        NOT NULL,
  name          text        NOT NULL,
  category      text        NOT NULL,   -- free-form; the FE renders a known set and falls back for the rest
  phone         text,                   -- E.164 ("+6591234567") — the only form wa.me/tel: reliably accept
  email         text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_vendors_pkey PRIMARY KEY (id),

  CONSTRAINT event_vendors_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

CREATE INDEX event_vendors_event_id_idx ON public.event_vendors (event_id);

-- 2) RLS ------------------------------------------------------------------------
-- Super-admin only: the couple's private list, like budget and gifts. No
-- INSERT/UPDATE/DELETE policies — every mutation goes through the SECURITY
-- DEFINER RPCs below, matching every other table.
ALTER TABLE public.event_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_vendors_select ON public.event_vendors
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

-- 3) Writes ---------------------------------------------------------------------
-- create/update carry assert_event_writable (paid/active + not over-limit).
-- delete stays ungated on purpose: a dormant module on a downgraded event must
-- still be cleanable — same rule 20260618000107 set for budget/gift deletes.

CREATE OR REPLACE FUNCTION public.create_vendor(
  p_event_id      uuid,
  p_name          text,
  p_category      text,
  p_phone         text DEFAULT NULL,
  p_email         text DEFAULT NULL,
  p_notes         text DEFAULT NULL
)
RETURNS event_vendors LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_row    event_vendors;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to add vendors';
  END IF;

  PERFORM assert_event_writable(p_event_id);

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'A vendor name is required';
  END IF;

  IF btrim(COALESCE(p_category, '')) = '' THEN
    RAISE EXCEPTION 'A category is required';
  END IF;

  INSERT INTO event_vendors (
    event_id, name, category, phone, email, notes
  )
  VALUES (
    p_event_id, btrim(p_name), btrim(p_category),
    p_phone, p_email, p_notes
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vendor(
  p_event_id      uuid,
  p_id            uuid,
  p_name          text,
  p_category      text,
  p_phone         text DEFAULT NULL,
  p_email         text DEFAULT NULL,
  p_notes         text DEFAULT NULL
)
RETURNS event_vendors LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_row    event_vendors;
BEGIN
  SELECT * INTO v_row FROM event_vendors WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendor not found';
  END IF;

  IF v_row.event_id != p_event_id THEN
    RAISE EXCEPTION 'Vendor does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to update vendors';
  END IF;

  PERFORM assert_event_writable(p_event_id);

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'A vendor name is required';
  END IF;

  IF btrim(COALESCE(p_category, '')) = '' THEN
    RAISE EXCEPTION 'A category is required';
  END IF;

  UPDATE event_vendors
  SET
    name          = btrim(p_name),
    category      = btrim(p_category),
    phone         = p_phone,
    email         = p_email,
    notes         = p_notes
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_vendor(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_row    event_vendors;
BEGIN
  SELECT * INTO v_row FROM event_vendors WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendor not found';
  END IF;

  IF v_row.event_id != p_event_id THEN
    RAISE EXCEPTION 'Vendor does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to remove vendors';
  END IF;

  -- No assert_event_writable — see the note above: deletes stay cleanable.
  DELETE FROM event_vendors WHERE id = p_id;
END;
$$;

-- Rollback:
--   DROP FUNCTION public.delete_vendor(uuid, uuid);
--   DROP FUNCTION public.update_vendor(uuid, uuid, text, text, text, text, text);
--   DROP FUNCTION public.create_vendor(uuid, text, text, text, text, text);
--   DROP TABLE public.event_vendors;   -- CASCADE drops policy + index + trigger
