-- Migration: seed the `peony-chinese` invitation template catalog row.
-- =============================================================================
-- Soft romantic design (blush + rose + rose-gold, layered peony motif).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Peony Chinese',
  'peony-chinese',
  'Soft and romantic — blush, rose and rose-gold with a layered peony bloom. Tender and garden-fresh.',
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
    "quote": "花好月圆",
    "quote_source": "Blooming flowers, a full moon",
    "section_title": "A Celebration of Love",
    "invitation_body": "Together with our families, we lovingly invite you to celebrate our marriage — a season of blossoms, and the beginning of forever.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Chen",
    "blessings_label": "Parents of the Groom",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Garden Pavilion",
    "venue_address": "The Garden Pavilion,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Garden Formal — Blush & Rose",
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
    "page_description": "We lovingly invite you to celebrate the beginning of forever.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'peony-chinese');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'peony-chinese';
