# Misc TODOs

Small, unrelated deferred items pulled out of code comments. Larger / coherent
ones get their own file in this folder.

## Password field autofill overlay
`src/components/custom/form/fields/PasswordField.tsx`

On autofill complete, the browser overlay sits on top of the field group instead
of within the group's boundary container. Fix the stacking/containment so it
stays inside the group.

## schema.sql — fill in inferred columns
`supabase/schema.sql`

Run the column query against the live DB and add the missing fields to the
reference schema (some sections are inferred from RPCs rather than the real
column list).

## Editing the account name (`profiles.name`)
`supabase/migrations/2026/06/18/20260618000101_profiles_name_and_signup.sql`,
`src/pages/admin/settings/profile/`

`profiles.name` is seeded at signup (the `handle_new_user` trigger) and read for
the create-event autofill + dashboard greeting, but there is **no edit path yet**.
The migration ships a row-scoped `profiles_update_self` policy, but RLS gates
rows, not columns — so it can't keep a client from writing `trial_ends_at`. When
the Settings → Profile page should edit the account name, add an
`update_profile_name(p_name text)` `SECURITY DEFINER` RPC that updates only
`name` (+ `updated_at`) for `auth.uid()`, and route the edit through it rather
than a direct table UPDATE. (Note: today the Profile page edits the *per-event*
`event_members.display_name`, which is a different field from the account name.)

## Avatar upload (account-level photo)
`src/pages/admin/settings/profile/components/ProfileForm.tsx`

The Profile form has a "Change photo" stub (disabled, "Uploads coming soon") and
the photo is meant to be global — one avatar across all the user's events, i.e.
account-level, so it belongs on `profiles`, not `event_members`. To wire it up:
add `profiles.avatar_url text`, create a Supabase Storage bucket with per-user
path RLS (`auth.uid()`-scoped read/write), an upload helper, and an
`update_profile_avatar` RPC (or direct storage + `name`-style scoped write).
Surface the resolved avatar wherever initials currently render (Profile form,
dashboard greeting).
