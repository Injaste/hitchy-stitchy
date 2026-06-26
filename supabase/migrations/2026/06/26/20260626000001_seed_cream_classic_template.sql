-- Migration: seed the `cream-classic` invitation template catalog row.
-- =============================================================================
-- Neutral classic design (ivory card, tone-on-tone embossed corner roses, serif
-- caps + script couple name). template_key matches the code registry key.
-- Global (event_id NULL = visible to every event). Idempotent via NOT EXISTS.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Cream Classic',
  'cream-classic',
  'Ivory card with tone-on-tone embossed corner roses, serif caps and a script couple name. Timeless and neutral.',
  '{
    "groom_name": "Daniel",
    "bride_name": "Grace",
    "font_couple": null, "font_heading": null, "font_body": null,
    "event_date": "2026-07-16",
    "event_time_start": "15:00",
    "greeting": "You are invited to celebrate the wedding of",
    "hero_divider_label": "The wedding of",
    "quote": "", "quote_source": "",
    "section_title": "A celebration of love",
    "invitation_body": "Together with our families, we joyfully invite you to celebrate our marriage.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Tan", "blessings_label": "Parents of the couple",
    "date": "16th July 2026",
    "time": "3.00 PM",
    "venue_name": "The Garden Pavilion",
    "venue_address": "Sentosa, Singapore",
    "dress_code": "Garden formal",
    "venue_map_link": "", "venue_map_embed_url": "",
    "itinerary_title": "Programme",
    "itinerary": [
      {"title": "Ceremony", "items": [{"time": "3.00pm", "label": "Guests seated"}, {"time": "3.30pm", "label": "Exchange of vows"}]},
      {"title": "Reception", "items": [{"time": "4.30pm", "label": "Cocktails & canapés"}, {"time": "6.00pm", "label": "Dinner is served"}]}
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
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'cream-classic');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'cream-classic';
