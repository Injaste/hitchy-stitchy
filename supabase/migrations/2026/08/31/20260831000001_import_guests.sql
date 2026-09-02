-- Migration: batch guest import
-- =============================================================================
-- Phase C-2 (docs/ux/phase-c-creation-and-lists.md §4) adds a paste/CSV import
-- to the Guests screen. Driving that through create_guest — the only existing
-- create path — is wrong in two ways, and neither is fixable client-side.
--
-- First, the plan cap. create_guest calls assert_plan('guests', v_count) INSIDE
-- its per-page FOREACH loop, so a 300-row import means 300 calls, each seeing a
-- count the previous ones already grew. Rows 1..k land, row k+1 raises, and the
-- user is left with a half-imported list and no way to tell which half. The
-- settled decision is the opposite: refuse the WHOLE batch before writing
-- anything. That needs ONE assert_plan over the batch total, up front — which
-- can only exist in a function that can see the whole batch.
--
-- Second, duplicates. create_guest RAISES on a phone that already exists on a
-- target page; the settled decision is to SKIP it and import the rest. One
-- already-known guest would otherwise abort an entire import.
--
-- So this is a NEW function, not a rewrite. create_guest, update_guest and
-- update_guests stay byte-for-byte untouched — they're on the never-mutate-in-
-- place list in this folder's README, and the deployed frontend calls them.
-- Element shape (name / phone / guest_count / status / message), the defaults,
-- the private-page phone rule and the dedup predicate are all copied from
-- create_guest verbatim so the two paths can't drift apart.
--
-- WHAT COUNTS AGAINST THE CAP. plan_within_limits('guests') sums guest_count —
-- HEADS, not rows — and create_guest inserts one row PER selected page, each
-- carrying the full guest_count. So a party of 4 added to two pages is 8 heads.
-- The batch total is therefore SUM(guest_count) over the (guest x page) pairs
-- that will ACTUALLY be written; skipped duplicates are excluded, or the server
-- would refuse a batch the preview already told the user fits. It's also why
-- guest_count is floored at 1: the cap check is a SUM here, so a negative count
-- would buy back capacity for the rest of the batch. create_guest can't be
-- worked that way (it checks one row at a time) and event_rsvps has no CHECK on
-- the column, so the floor is enforced here.
--
-- DEDUP. create_guest (20260618000109) matches the raw phone after btrim:
--     IF v_phone IS NOT NULL AND EXISTS (
--       SELECT 1 FROM event_rsvps WHERE invitation_id = v_page AND phone = v_phone
--     ) THEN ...
-- An import compares the same way but on a WHITESPACE-STRIPPED key, because a
-- paste is the one place both shapes of a phone meet: submit_rsvp stores a
-- public RSVP with every space removed (regexp_replace(...,'\s+','','g')),
-- while a typed guest keeps the spaces the couple typed. Their master sheet
-- reads '+65 9123 4567' where the RSVP row reads '+6591234567' — the same
-- person, and a raw match would import them twice and spend the cap twice. Only
-- the comparison is normalised; the phone is STORED exactly as sent, and the
-- same phone on two pages stays legal (UNIQUE (invitation_id, phone)). Phones
-- are NULLS DISTINCT, so a guest with no phone can never collide and always
-- imports. Skipping is silent: the client flags duplicates in the import
-- preview using the same key, and compares the returned rows against what it
-- sent to report what was skipped.
--
-- The same predicate also settles duplicates WITHIN one paste — the first
-- occurrence of a (page, phone) wins and later ones are skipped, so a list
-- carrying the same person twice imports them once instead of failing.
--
-- A row with no name RAISES rather than being skipped. The client excludes
-- nameless rows from the batch it sends (they're flagged in the preview), so
-- one arriving here means the payload is wrong — and silently dropping a row
-- the user watched get counted is worse than failing. Same for party sizes
-- outside the pages' shared min/max: the message names the guest so the user
-- can find the row, rather than pointing at a page.
--
-- The all-or-nothing promise needs one more thing than a single check: two
-- imports running at once would each read the same pre-insert head count and
-- each pass, so the pair could land a whole batch over the cap (create_guest
-- has the same race, but its per-row check bounds the overshoot at one guest).
-- An event-scoped advisory lock, taken before the check and held to commit,
-- serialises imports on one event so the second one measures the first.
--
-- Batch size is capped at 1000 elements. Nothing else bounds it — the plan cap
-- counts heads, not rows — so without this a large event on a large plan could
-- paste an unbounded list and hold a transaction open across it. 1000 is well
-- clear of the largest plan's guest cap (5000 heads).
-- =============================================================================

-- New: whole-batch guest import for the paste/CSV door. One up-front plan
-- check, duplicates skipped instead of fatal, all-or-nothing.
CREATE OR REPLACE FUNCTION public.import_guests(
  p_event_id       uuid,
  p_invitation_ids uuid[],
  p_guests         jsonb
)
RETURNS SETOF event_rsvps
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  c_max_batch constant int := 1000;
  v_caller    event_members;
  v_page_ids  uuid[];
  v_found     int;
  v_min       int;
  v_max       int;
  v_private   boolean;
  v_ord       int;
  v_name      text;
  v_parsed    jsonb;
  v_rows      jsonb;
  v_heads     int;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'guests', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create guests';
  END IF;

  PERFORM assert_event_writable(p_event_id);

  IF p_invitation_ids IS NULL OR array_length(p_invitation_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Select at least one invitation page';
  END IF;

  -- Type first, in its own IF: jsonb_array_length() RAISES on a non-array, and
  -- OR isn't guaranteed to short-circuit, so folding these together can leak a
  -- raw "cannot get array length of a non-array" instead of this message.
  IF p_guests IS NULL OR jsonb_typeof(p_guests) <> 'array' THEN
    RAISE EXCEPTION 'There are no guests to import';
  END IF;

  IF jsonb_array_length(p_guests) = 0 THEN
    RAISE EXCEPTION 'There are no guests to import';
  ELSIF jsonb_array_length(p_guests) > c_max_batch THEN
    RAISE EXCEPTION 'An import can hold at most % guests at a time (this one has %). Split the list and import again.',
      c_max_batch, jsonb_array_length(p_guests);
  END IF;

  -- The same page listed twice would double every guest's heads AND double the
  -- inserts for phone-less guests (which never collide), so collapse it first.
  SELECT array_agg(DISTINCT x) INTO v_page_ids FROM unnest(p_invitation_ids) x;

  SELECT count(*) INTO v_found
  FROM event_invitations
  WHERE event_id = p_event_id AND id = ANY(v_page_ids);

  IF v_found <> COALESCE(array_length(v_page_ids, 1), 0) THEN
    RAISE EXCEPTION 'Invitation not found for this event';
  END IF;

  -- Every guest lands on every selected page, so the party size has to satisfy
  -- all of them at once: the intersection is max-of-mins to min-of-maxes.
  -- create_guest reaches the same answer by checking each page in its loop.
  SELECT max(guest_count_min), min(guest_count_max), bool_or(rsvp_mode = 'private')
    INTO v_min, v_max, v_private
  FROM event_invitations
  WHERE event_id = p_event_id AND id = ANY(v_page_ids);

  -- Floor the minimum at 1 regardless of what the pages say: the cap check
  -- below is a SUM over the batch, so a zero or negative party size on one row
  -- would buy back capacity for the rest of it. create_guest can't be worked
  -- that way (it checks one row at a time) and event_rsvps has no CHECK on the
  -- column, so this is the only place it's enforced.
  v_min := GREATEST(v_min, 1);

  IF v_min > v_max THEN
    RAISE EXCEPTION 'The selected pages have incompatible party-size limits (at least %, at most %)',
      v_min, v_max;
  END IF;

  -- Parse once. Defaults are create_guest's: absent status is 'confirmed',
  -- absent party size is 1, blank name/phone become NULL.
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'ord',         t.ord,
           'name',        NULLIF(btrim(t.g->>'name'), ''),
           'phone',       NULLIF(btrim(t.g->>'phone'), ''),
           'guest_count', COALESCE((t.g->>'guest_count')::integer, 1),
           'status',      COALESCE((t.g->>'status')::event_rsvp_status, 'confirmed'),
           'message',     t.g->>'message'
         ) ORDER BY t.ord), '[]'::jsonb)
    INTO v_parsed
  FROM jsonb_array_elements(p_guests) WITH ORDINALITY AS t(g, ord);

  SELECT min((r->>'ord')::int) INTO v_ord
  FROM jsonb_array_elements(v_parsed) r
  WHERE r->>'name' IS NULL;

  IF v_ord IS NOT NULL THEN
    -- Position in the submitted batch, NOT the user's row number — the client
    -- has already dropped the rows it flagged. This is a contract breach, not
    -- something the user is expected to act on.
    RAISE EXCEPTION 'Every guest needs a name (guest % in this import has none)', v_ord;
  END IF;

  SELECT r->>'name' INTO v_name
  FROM jsonb_array_elements(v_parsed) r
  WHERE (r->>'guest_count')::int < v_min
  ORDER BY (r->>'ord')::int
  LIMIT 1;

  IF v_name IS NOT NULL THEN
    RAISE EXCEPTION 'Guest count must be at least % on every selected page (%)', v_min, v_name;
  END IF;

  SELECT r->>'name' INTO v_name
  FROM jsonb_array_elements(v_parsed) r
  WHERE (r->>'guest_count')::int > v_max
  ORDER BY (r->>'ord')::int
  LIMIT 1;

  IF v_name IS NOT NULL THEN
    RAISE EXCEPTION 'Guest count cannot exceed % on every selected page (%)', v_max, v_name;
  END IF;

  -- A private page's guests are matched by phone when they claim, so phone is
  -- required — and every guest goes to every selected page, so one private page
  -- makes phone mandatory for the whole batch.
  IF v_private THEN
    SELECT r->>'name' INTO v_name
    FROM jsonb_array_elements(v_parsed) r
    WHERE r->>'phone' IS NULL
    ORDER BY (r->>'ord')::int
    LIMIT 1;

    IF v_name IS NOT NULL THEN
      RAISE EXCEPTION 'A reserved guest needs a phone number (%)', v_name;
    END IF;
  END IF;

  -- Resolve the rows that will actually be written, ONCE — the plan check and
  -- the INSERT must agree on the set, or the batch total is a different number
  -- from what lands.
  WITH pairs AS (
    SELECT
      (r->>'ord')::int                  AS ord,
      p.page                            AS page,
      r->>'name'                        AS name,
      r->>'phone'                       AS phone,
      (r->>'guest_count')::int          AS guest_count,
      (r->>'status')::event_rsvp_status AS status,
      r->>'message'                     AS message
    FROM jsonb_array_elements(v_parsed) r
    CROSS JOIN unnest(v_page_ids) AS p(page)
  ),
  -- Duplicates within the paste: first occurrence of a (page, phone) wins, on
  -- the whitespace-stripped key so one person typed two ways is still one row.
  -- A NULL phone is never a duplicate, so it bypasses the window entirely.
  first_in_batch AS (
    SELECT * FROM (
      SELECT pairs.*,
             CASE WHEN pairs.phone IS NULL THEN 1
                  ELSE row_number() OVER (
                    PARTITION BY pairs.page, regexp_replace(pairs.phone, '\s+', '', 'g')
                    ORDER BY pairs.ord
                  )
             END AS rn
      FROM pairs
    ) ranked
    WHERE ranked.rn = 1
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'page',        f.page,
           'name',        f.name,
           'phone',       f.phone,
           'guest_count', f.guest_count,
           'status',      f.status,
           'message',     f.message
         ) ORDER BY f.ord, f.page), '[]'::jsonb)
    INTO v_rows
  FROM first_in_batch f
  WHERE f.phone IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM event_rsvps
       WHERE invitation_id = f.page
         AND regexp_replace(phone, '\s+', '', 'g')
           = regexp_replace(f.phone, '\s+', '', 'g')
     );

  SELECT COALESCE(sum((r->>'guest_count')::int), 0) INTO v_heads
  FROM jsonb_array_elements(v_rows) r;

  -- The whole point of this function: ONE cap check, over the whole batch,
  -- before a single row is written. Over the cap refuses everything.
  -- The lock is what makes that hold under two imports at once: it is held to
  -- commit, so a second import waits and then counts the first one's rows
  -- instead of reading the same pre-insert total and passing on it too.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_event_id::text, 0));
  PERFORM assert_plan(p_event_id, 'guests', v_heads);

  RETURN QUERY
  WITH ins AS (
    INSERT INTO event_rsvps (
      event_id, invitation_id, name, phone, guest_count, message, status, confirmed_at, cancelled_at
    )
    SELECT
      p_event_id,
      (r->>'page')::uuid,
      r->>'name',
      r->>'phone',
      (r->>'guest_count')::int,
      r->>'message',
      (r->>'status')::event_rsvp_status,
      CASE WHEN r->>'status' = 'confirmed' THEN now() ELSE NULL END,
      CASE WHEN r->>'status' = 'cancelled' THEN now() ELSE NULL END
    FROM jsonb_array_elements(v_rows) r
    RETURNING *
  )
  SELECT * FROM ins;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.import_guests(uuid, uuid[], jsonb) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.import_guests(uuid, uuid[], jsonb) TO authenticated;

-- Rollback:
--   1) DROP FUNCTION public.import_guests(uuid, uuid[], jsonb);
--   Nothing else to restore — this migration only ADDS a function. create_guest,
--   update_guest, update_guests and delete_guests are untouched.
