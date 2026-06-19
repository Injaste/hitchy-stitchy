-- Migration: seed the `imperial-chinese` invitation template catalog row.
-- =============================================================================
-- Ornate dark design (deep oxblood + gold, lantern + cloud-scroll motifs).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Imperial Chinese',
  'imperial-chinese',
  'Ornate and opulent — deep oxblood and gold with lantern and cloud-scroll motifs. The dramatic, dark counterpart.',
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
    "quote": "龙凤呈祥",
    "quote_source": "Prosperity brought by dragon and phoenix",
    "section_title": "A Celebration of Love",
    "invitation_body": "Together with our families, we are honoured to invite you to celebrate our marriage — an auspicious union, joined in prosperity and joy.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Chen",
    "blessings_label": "Parents of the Groom",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Grand Ballroom",
    "venue_address": "The Grand Ballroom,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Black Tie — Oxblood & Gold",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "Programme",
    "itinerary": [
      {"title": "Tea Ceremony", "items": [{"time": "10:00am", "label": "Family tea ceremony"}]},
      {"title": "Banquet", "items": [{"time": "7:00pm", "label": "Reception begins"}, {"time": "7:30pm", "label": "Dinner is served"}]},
      {"title": "Toast", "items": [{"time": "9:00pm", "label": "Yam seng"}]}
    ],
    "footnote": "A ten-course dinner banquet",
    "rsvp_subtitle": "Your presence would mean the world to us.",
    "rsvp_success_heading": "Thank you!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and gratitude,",
    "page_title": "The Wedding of Jun Wei & Mei Ling",
    "page_description": "We are honoured to invite you to celebrate our marriage.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'imperial-chinese');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'imperial-chinese';
