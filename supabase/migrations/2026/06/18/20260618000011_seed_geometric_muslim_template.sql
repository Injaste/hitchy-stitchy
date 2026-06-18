-- Migration: seed the `geometric-muslim` invitation template catalog row.
-- =============================================================================
-- Adds a second authored template (a midnight-blue + gold, Islamic-geometry
-- variation of unique-muslim) to the global catalog so couples can pick it in
-- the theme browser. `template_key` matches the code registry key in
-- src/pages/wedding/templates/index.ts. field_config is the base content shown
-- when the template is first applied (generic sample, not a real couple).
--
-- Idempotent: guarded by NOT EXISTS on template_key (the table has no unique
-- constraint on it — PK is id).
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Geometric Muslim',
  'geometric-muslim',
  'Midnight blue & gold with Islamic geometric motifs — a darker, regal counterpart to Unique Muslim.',
  '{
    "groom_name": "Ahmad",
    "bride_name": "Sarah",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ\nMay peace be upon you",
    "hero_divider_label": "The Wedding of",
    "quote": "وَخَلَقْنَاكُمْ أَزْوَاجًا\nAnd We created you in pairs",
    "quote_source": "Surah An-Naba 78:8",
    "section_title": "A Celebration of Love",
    "invitation_body": "In the name of Allah, the Most Gracious, the Most Merciful. We joyfully invite you to share in the blessing of our union, as two souls become one — guided by faith and bound by love.",
    "blessings_prefix": "With the blessings of",
    "blessings_name": "Hj Ahmad & Hjh Ramlah",
    "blessings_label": "Parents of the Groom",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Grand Ballroom",
    "venue_address": "The Grand Ballroom,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Traditional — Shades of Blue & Gold",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "Programme",
    "itinerary": [
      {"title": "Nikah", "items": [{"time": "10:45am", "label": "To be seated"}, {"time": "11:00am", "label": "Ceremony begins"}]},
      {"title": "Reception", "items": [{"time": "12:30pm", "label": "Welcome of guests"}, {"time": "1:00pm", "label": "Lunch is served"}]},
      {"title": "End", "items": [{"time": "4:00pm", "label": ""}]}
    ],
    "footnote": "*All meals are Halal",
    "rsvp_subtitle": "Your presence would mean the world to us.",
    "rsvp_success_heading": "Alhamdulillah!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Well Wishes",
    "footer_tagline": "With love and prayers,",
    "page_title": "The Wedding of Ahmad & Sarah",
    "page_description": "We joyfully invite you to share in the blessing of our union.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_templates WHERE template_key = 'geometric-muslim'
);

-- Rollback:
--   DELETE FROM public.event_templates WHERE template_key = 'geometric-muslim';
