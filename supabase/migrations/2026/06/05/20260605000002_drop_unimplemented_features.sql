-- Migration: drop unimplemented feature tables
--
-- vendors, announcements and live-logs were never built out (the frontend has
-- only a placeholder vendor page + marketing copy). Their resources are already
-- removed from the access catalog by 20260605000001. Dropping the tables keeps
-- the schema honest. Kept separate from the access-model migration so it can be
-- reviewed / reverted independently.

DROP TABLE IF EXISTS public.event_announcement_reads CASCADE;
DROP TABLE IF EXISTS public.event_announcements      CASCADE;
DROP TABLE IF EXISTS public.event_live_logs          CASCADE;
DROP TABLE IF EXISTS public.event_vendors            CASCADE;
