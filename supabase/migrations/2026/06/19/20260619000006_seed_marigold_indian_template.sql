-- Migration: seed the `marigold-indian` invitation template catalog row.
-- =============================================================================
-- Festive design (marigold orange + magenta + leaf-green, garland/toran motif).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Marigold Indian',
  'marigold-indian',
  'Festive and joyful — marigold orange, magenta and leaf-green with a garland (toran) motif. Bold and celebratory.',
  '{
    "groom_name": "Arjun",
    "bride_name": "Priya",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "शुभ विवाह\nWith joyful hearts, we invite you",
    "hero_divider_label": "The Wedding of",
    "quote": "May this union be blessed with love and laughter",
    "quote_source": "A blessing for the couple",
    "section_title": "With the blessings of our families",
    "invitation_body": "Together with our families, we joyfully invite you to celebrate our wedding — a festival of colour, music and love.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Sharma",
    "blessings_label": "Parents of the Bride",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Grand Mandap",
    "venue_address": "The Grand Mandap,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Festive Indian — Bright & Bold",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "The Celebrations",
    "itinerary": [
      {"title": "Haldi", "items": [{"time": "10:00am", "label": "Haldi ceremony"}]},
      {"title": "Baraat", "items": [{"time": "5:00pm", "label": "Grooms procession"}]},
      {"title": "Pheras", "items": [{"time": "7:00pm", "label": "Wedding ceremony"}, {"time": "8:30pm", "label": "Dinner is served"}]}
    ],
    "footnote": "Dinner & dancing to follow",
    "rsvp_subtitle": "Your presence would mean the world to us.",
    "rsvp_success_heading": "Dhanyavaad!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and blessings,",
    "page_title": "The Wedding of Arjun & Priya",
    "page_description": "We joyfully invite you to celebrate our wedding.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'marigold-indian');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'marigold-indian';
