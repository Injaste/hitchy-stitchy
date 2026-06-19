-- Migration: seed the `lotus-indian` invitation template catalog row.
-- =============================================================================
-- Modern minimal design (blush + ivory + rose-gold, single lotus line).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Lotus Indian',
  'lotus-indian',
  'Modern and minimal — blush, ivory and rose-gold with a single fine lotus line and generous white space. The light, contemporary alternative.',
  '{
    "groom_name": "Aditya",
    "bride_name": "Sara",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "We''re getting married",
    "hero_divider_label": "Save the Date",
    "quote": "To love and be loved",
    "quote_source": "— together at last",
    "section_title": "An Invitation",
    "invitation_body": "Together with our families, we''d love for you to join us as we begin our forever — simply, joyfully, surrounded by the people we love.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "The Mehta & Khan Families",
    "blessings_label": "joyfully invite you",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Riverside Lawns",
    "venue_address": "The Riverside Lawns,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Indian Contemporary — Pastels",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "The Day",
    "itinerary": [
      {"title": "Ceremony", "items": [{"time": "5:00pm", "label": "Pheras"}]},
      {"title": "Cocktails", "items": [{"time": "6:30pm", "label": "Drinks & canapes"}]},
      {"title": "Reception", "items": [{"time": "7:30pm", "label": "Dinner & dancing"}]}
    ],
    "footnote": "Dinner & dancing to follow",
    "rsvp_subtitle": "We''d love for you to join us.",
    "rsvp_success_heading": "Thank you!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "We can''t wait to celebrate with you,",
    "page_title": "The Wedding of Aditya & Sara",
    "page_description": "We''d love for you to join us as we begin our forever.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'lotus-indian');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'lotus-indian';
