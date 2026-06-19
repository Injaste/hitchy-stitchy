-- Migration: seed the `mehndi-indian` invitation template catalog row.
-- =============================================================================
-- Ornate design (henna green + maroon + gold, paisley / mandala line-art).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Mehndi Indian',
  'mehndi-indian',
  'Ornate and ceremonial — henna green, maroon and gold with paisley and mandala line-art. Elegant and symmetrical.',
  '{
    "groom_name": "Rohan",
    "bride_name": "Aanya",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "Together with our families",
    "hero_divider_label": "The Wedding of",
    "quote": "Two souls, one journey",
    "quote_source": "A blessing for the couple",
    "section_title": "An Invitation",
    "invitation_body": "Together with our families, we warmly invite you to celebrate our marriage — woven with tradition, ceremony and joy.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Kapoor",
    "blessings_label": "Parents of the Bride",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Heritage Haveli",
    "venue_address": "The Heritage Haveli,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Traditional — Green & Gold",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "Ceremonies",
    "itinerary": [
      {"title": "Mehndi", "items": [{"time": "4:00pm", "label": "Henna ceremony"}]},
      {"title": "Sangeet", "items": [{"time": "7:00pm", "label": "Music & dance"}]},
      {"title": "Vivah", "items": [{"time": "11:00am", "label": "Wedding ceremony"}, {"time": "1:00pm", "label": "Lunch is served"}]}
    ],
    "footnote": "Dinner to follow",
    "rsvp_subtitle": "Your presence would mean the world to us.",
    "rsvp_success_heading": "Shukriya!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and blessings,",
    "page_title": "The Wedding of Rohan & Aanya",
    "page_description": "We warmly invite you to celebrate our marriage.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'mehndi-indian');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'mehndi-indian';
