-- Migration: rename `subscribers` -> `waitlist_signups`
--
-- `subscribers` is the pre-launch waitlist email list (the public "notify me at
-- launch" form). Its name collided with `push_subscriptions` (the Web Push
-- device-endpoint table), causing confusion about which stored what. Renamed for
-- clarity. Safe — not live yet, and only one call site (signup/api.ts) touches it.

ALTER TABLE public.subscribers RENAME TO waitlist_signups;

ALTER TABLE public.waitlist_signups RENAME CONSTRAINT subscribers_pkey TO waitlist_signups_pkey;

ALTER POLICY subscribers_insert ON public.waitlist_signups RENAME TO waitlist_signups_insert;

-- Rollback:
--   ALTER POLICY waitlist_signups_insert ON public.waitlist_signups RENAME TO subscribers_insert;
--   ALTER TABLE public.waitlist_signups RENAME CONSTRAINT waitlist_signups_pkey TO subscribers_pkey;
--   ALTER TABLE public.waitlist_signups RENAME TO subscribers;
