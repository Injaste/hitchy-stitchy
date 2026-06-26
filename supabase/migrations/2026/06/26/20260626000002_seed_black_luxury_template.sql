-- Migration: seed the `black-luxury` invitation template catalog row.
-- =============================================================================
-- Neutral dark design (matte black, cream botanical line-art, wax-seal motif,
-- script couple names, gold accents). template_key matches the code registry key.
-- Global (event_id NULL = visible to every event). Idempotent via NOT EXISTS.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Black Luxury',
  'black-luxury',
  'Matte-black card with cream botanical line-art, a wax-seal motif, script couple names and gold accents. Dark, formal and luxe.',
  '{
    "groom_name": "Daniel",
    "bride_name": "Grace",
    "font_couple": "Pinyon Script", "font_heading": "Playfair Display", "font_body": "EB Garamond",
    "event_date": "2026-10-10",
    "event_time_start": "19:00",
    "greeting": "You are invited to celebrate the wedding of",
    "hero_divider_label": "The wedding of",
    "quote": "", "quote_source": "",
    "section_title": "A celebration of love",
    "invitation_body": "Together with our families, we joyfully invite you to celebrate our marriage.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Tan", "blessings_label": "Parents of the couple",
    "date": "10th October 2026",
    "time": "7.00 PM",
    "venue_name": "The Grand Ballroom",
    "venue_address": "1 Marina Boulevard, Singapore 018989",
    "dress_code": "Black tie",
    "venue_map_link": "", "venue_map_embed_url": "",
    "itinerary_title": "Programme",
    "itinerary": [
      {"title": "Reception", "items": [{"time": "7.00pm", "label": "Cocktails & arrival"}, {"time": "7.45pm", "label": "Guests seated"}]},
      {"title": "Dinner", "items": [{"time": "8.00pm", "label": "Dinner is served"}, {"time": "9.30pm", "label": "Toasts & celebration"}]}
    ],
    "footnote": "",
    "rsvp_subtitle": "Your presence would mean the world to us.",
    "rsvp_success_heading": "Thank you!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and gratitude",
    "page_title": "", "page_description": "", "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'black-luxury');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'black-luxury';
