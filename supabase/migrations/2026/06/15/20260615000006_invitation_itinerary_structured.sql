-- Migration: programme/itinerary -> structured jsonb (section-list field).
-- =============================================================================
-- #5: the programme moves from a blank-line STRING to real structured jsonb —
-- [{ "title", "items": [{ "time", "label" }] }] — so it's typed + queryable and
-- no longer parsed from text. Convert the template base config + any existing
-- invitation whose itinerary is still a string. (The blank-line string can't be
-- parsed in pure SQL; this is dev data, so string itineraries are reset to the
-- base array. The engine also tolerates legacy strings, so nothing breaks before
-- this runs.)
-- =============================================================================

UPDATE public.event_templates
SET config = jsonb_set(
  config,
  '{itinerary}',
  '[
    {"title": "Akad Nikah", "items": [
      {"time": "10:00 AM", "label": "Solemnization"},
      {"time": "10:30 AM", "label": "Exchange of Vows"}
    ]},
    {"title": "Reception", "items": [
      {"time": "12:00 PM", "label": "Lunch & Celebration"},
      {"time": "3:00 PM", "label": "Photography"}
    ]}
  ]'::jsonb
)
WHERE template_key = 'unique-muslim';

UPDATE public.event_invitations
SET theme_config = jsonb_set(
  theme_config,
  '{itinerary}',
  '[
    {"title": "Akad Nikah", "items": [
      {"time": "10:00 AM", "label": "Solemnization"},
      {"time": "10:30 AM", "label": "Exchange of Vows"}
    ]},
    {"title": "Reception", "items": [
      {"time": "12:00 PM", "label": "Lunch & Celebration"},
      {"time": "3:00 PM", "label": "Photography"}
    ]}
  ]'::jsonb
)
WHERE jsonb_typeof(theme_config -> 'itinerary') = 'string';

-- Rollback: not meaningful (the legacy string format is lossy to reconstruct);
-- the engine still renders either shape.
