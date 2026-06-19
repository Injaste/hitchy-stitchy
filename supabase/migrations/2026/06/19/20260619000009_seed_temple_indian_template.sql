-- Migration: seed the `temple-indian` invitation template catalog row.
-- =============================================================================
-- South-Indian design (gold + maroon Kanjeevaram tones, gopuram + kolam motif).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Temple Indian',
  'temple-indian',
  'Traditional South-Indian — gold and maroon Kanjeevaram tones with gopuram temple-border and kolam motifs. Structured and ceremonial.',
  '{
    "groom_name": "Karthik",
    "bride_name": "Lakshmi",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "With the blessings of the Almighty",
    "hero_divider_label": "The Wedding of",
    "quote": "ॐ — may the divine bless this sacred union",
    "quote_source": "A blessing for the couple",
    "section_title": "Shubha Vivaham",
    "invitation_body": "Together with our families, we cordially invite you to grace the wedding of our children — a sacred ceremony blessed by tradition.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Iyer",
    "blessings_label": "Parents of the Bride",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "Sri Kalyana Mandapam",
    "venue_address": "Sri Kalyana Mandapam,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Traditional — Silk & Gold",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "Muhurtham",
    "itinerary": [
      {"title": "Kashi Yatra", "items": [{"time": "6:00am", "label": "Ceremonial walk"}]},
      {"title": "Muhurtham", "items": [{"time": "9:00am", "label": "Sacred wedding rites"}]},
      {"title": "Sadhya", "items": [{"time": "12:00pm", "label": "Traditional feast"}]}
    ],
    "footnote": "Lunch to follow",
    "rsvp_subtitle": "Your presence would bless us.",
    "rsvp_success_heading": "Nandri!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and blessings,",
    "page_title": "The Wedding of Karthik & Lakshmi",
    "page_description": "We cordially invite you to grace our wedding.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'temple-indian');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'temple-indian';
