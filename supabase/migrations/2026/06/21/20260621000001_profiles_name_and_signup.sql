-- Migration: profiles.name + signup integration
-- =============================================================================
-- Gives every account a real name. `profiles.name` is ACCOUNT-level (one per
-- auth user) — distinct from event_members.display_name, which is PER-EVENT
-- (how you appear to one event's team). The name is captured at signup and read
-- by the dashboard greeting + the create-event display-name autofill.
--
-- A trigger on auth.users seeds the profile row on signup, because the client
-- cannot INSERT into profiles under its SELECT-self-only RLS. Edits go through
-- the update_profile_name RPC (SECURITY DEFINER) — there is deliberately NO
-- broad UPDATE policy, so trial_ends_at / billing columns stay client-unwritable.
--
-- Additive; no shared/public RPC touched. Must run AFTER 20260618000102, which
-- creates the profiles table (06-18 < 06-21, so the paste-run order handles it).
-- =============================================================================

-- ── name column ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;

-- ── seed a profile row on every signup, and REQUIRE a name ─────────────────────
-- Copies the signup's full_name metadata into profiles.name and guarantees the
-- row exists (ON CONFLICT DO NOTHING — safe if create_event's trial-seed or a
-- re-run already created it).
--
-- The name is mandatory: signup is GoTrue's auth.signUp (not an RPC we can guard),
-- so this AFTER INSERT trigger is the only server-side seam. It runs inside the
-- signup transaction, so RAISE here rolls back the auth.users insert — a blank
-- name cancels the whole signup atomically (the form's zod is just the UX half).
-- Scoped to email/password signups so future OAuth / admin-created users (which
-- may not carry full_name) aren't blocked.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name text := NULLIF(btrim(NEW.raw_user_meta_data->>'full_name'), '');
BEGIN
  IF v_name IS NULL AND COALESCE(NEW.raw_app_meta_data->>'provider', 'email') = 'email' THEN
    RAISE EXCEPTION 'A name is required to sign up' USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, v_name)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── backfill existing accounts ─────────────────────────────────────────────────
INSERT INTO public.profiles (id, name)
SELECT u.id, NULLIF(btrim(u.raw_user_meta_data->>'full_name'), '')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ── update_profile_name: the only client write path for name ───────────────────
-- New: lets an account edit its OWN name (auth.uid()) without exposing the
-- trial/billing columns a table UPDATE policy would. A name is REQUIRED — blank
-- is rejected, same invariant the signup trigger enforces, so the name can never
-- be cleared once set.
CREATE OR REPLACE FUNCTION public.update_profile_name(p_name text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name text := NULLIF(btrim(p_name), '');
BEGIN
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'A name is required' USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.profiles
     SET name = v_name,
         updated_at = now()
   WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_profile_name(text) TO authenticated;

-- Rollback:
--   DROP FUNCTION IF EXISTS public.update_profile_name(text);
--   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--   DROP FUNCTION IF EXISTS public.handle_new_user();
--   ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;
