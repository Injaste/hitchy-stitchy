# Misc TODOs

Small, unrelated deferred items pulled out of code comments. Larger / coherent
ones get their own file in this folder.

## Password field autofill overlay
`src/components/custom/form/fields/PasswordField.tsx`

On autofill complete, the browser overlay sits on top of the field group instead
of within the group's boundary container. Fix the stacking/containment so it
stays inside the group.

## Unique-muslim template — image field upload
`src/pages/wedding/templates/unique-muslim/types.ts`

Support `type: "image"` with native upload once the field renderer handles it.
Currently only a pasted URL is accepted.

## schema.sql — fill in inferred columns
`supabase/schema.sql`

Run the column query against the live DB and add the missing fields to the
reference schema (some sections are inferred from RPCs rather than the real
column list).
