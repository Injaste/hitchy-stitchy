-- Migration: seed the `zellij-muslim` invitation template catalog row.
-- =============================================================================
-- Fifth authored Muslim template — a vibrant Moroccan zellij design (warm cream
-- ground with a tessellated terracotta/teal/ochre tile pattern, filled star-tile
-- motifs, tile-band dividers, Marcellus Roman names). The only colourful/patterned
-- template. `template_key` matches the code registry key in
-- src/pages/wedding/templates/index.ts. field_config is the base content shown
-- when the template is first applied (generic sample, not a real couple).
--
-- Idempotent: guarded by NOT EXISTS on template_key (no unique constraint on it).
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Zellij Muslim',
  'zellij-muslim',
  'Vibrant Moroccan zellij — warm cream with a terracotta, teal and ochre tile pattern and filled star-tile motifs. The colourful, patterned counterpart to the restrained Muslim designs.',
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
    "invitation_body": "In the name of Allah, the Most Gracious, the Most Merciful. With hearts full of joy, we invite you to celebrate the union of two souls — woven together by faith and love, like the pieces of a mosaic made whole.",
    "blessings_prefix": "With the blessings of",
    "blessings_name": "Hj Ahmad & Hjh Ramlah",
    "blessings_label": "Parents of the Groom",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Grand Ballroom",
    "venue_address": "The Grand Ballroom,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Festive — Terracotta & Teal",
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
    "page_description": "With hearts full of joy, we invite you to celebrate the union of two souls.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_templates WHERE template_key = 'zellij-muslim'
);

-- Rollback:
--   DELETE FROM public.event_templates WHERE template_key = 'zellij-muslim';
