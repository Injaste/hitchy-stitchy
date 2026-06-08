-- Migration: drop the dormant event_settings.task_order column
-- =============================================================================
-- The ordering engine (20260608000010) moved ordering onto a per-row `position`
-- float on event_tasks. Since that migration + the frontend rebuild, nothing
-- reads or writes task_order: every task RPC was rewritten off the jsonb and
-- update_task_order was dropped. This removes the now-dormant column.
--
-- Irreversible — it discards the original per-status ordering arrays. Run ONLY
-- once the position engine is proven in production: any still-running older
-- build selects task_order and would break the moment the column is gone.
-- =============================================================================

ALTER TABLE event_settings DROP COLUMN task_order;
