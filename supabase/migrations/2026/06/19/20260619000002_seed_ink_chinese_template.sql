-- Migration: seed the `ink-chinese` invitation template catalog row.
-- =============================================================================
-- Sumi ink-wash design (rice-paper cream + charcoal + cinnabar seal, brush
-- dividers). Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Ink Chinese',
  'ink-chinese',
  'Sumi ink-wash — rice-paper cream, charcoal and a cinnabar seal, with brush-stroke dividers. Spare, artistic and modern.',
  '{
    "groom_name": "Jun Wei",
    "bride_name": "Mei Ling",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "诚邀您\nWith joyful hearts, we invite you",
    "hero_divider_label": "The Wedding of",
    "quote": "执子之手，与子偕老",
    "quote_source": "Hand in hand, we grow old together",
    "section_title": "A Celebration of Love",
    "invitation_body": "Together with our families, we warmly invite you to share in the quiet joy of our union — two lives, written into one story.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Chen",
    "blessings_label": "Parents of the Groom",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Grand Ballroom",
    "venue_address": "The Grand Ballroom,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Smart — Ink & Cream",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "Programme",
    "itinerary": [
      {"title": "Tea Ceremony", "items": [{"time": "10:00am", "label": "Family tea ceremony"}]},
      {"title": "Banquet", "items": [{"time": "12:00pm", "label": "Reception begins"}, {"time": "12:30pm", "label": "Lunch is served"}]},
      {"title": "Toast", "items": [{"time": "2:30pm", "label": "Yam seng"}]}
    ],
    "footnote": "Dinner banquet to follow",
    "rsvp_subtitle": "Your presence would mean the world to us.",
    "rsvp_success_heading": "Thank you!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and gratitude,",
    "page_title": "The Wedding of Jun Wei & Mei Ling",
    "page_description": "We warmly invite you to share in the quiet joy of our union.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'ink-chinese');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'ink-chinese';
