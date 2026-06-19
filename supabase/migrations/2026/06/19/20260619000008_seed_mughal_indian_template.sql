-- Migration: seed the `mughal-indian` invitation template catalog row.
-- =============================================================================
-- Royal dark design (deep maroon + gold, jharokha arch + peacock motif).
-- Idempotent via NOT EXISTS on template_key.
-- =============================================================================

INSERT INTO public.event_templates (name, template_key, description, field_config, is_active)
SELECT
  'Mughal Indian',
  'mughal-indian',
  'Regal and opulent — deep maroon and gold with jharokha arch and peacock motifs. The dramatic, dark counterpart.',
  '{
    "groom_name": "Vikram",
    "bride_name": "Ishani",
    "font_couple": null,
    "font_heading": null,
    "font_body": null,
    "event_date": "2026-07-04",
    "event_time_start": "11:00",
    "greeting": "By the grace of the divine",
    "hero_divider_label": "The Royal Wedding of",
    "quote": "A union written in the stars",
    "quote_source": "A blessing for the couple",
    "section_title": "A Royal Celebration",
    "invitation_body": "Together with our families, we are honoured to invite you to celebrate our marriage — a grand union of two hearts and two houses.",
    "blessings_prefix": "Together with their families",
    "blessings_name": "Mr & Mrs Singh",
    "blessings_label": "Parents of the Groom",
    "date": "4th July 2026",
    "time": "11 AM",
    "venue_name": "The Palace Gardens",
    "venue_address": "The Palace Gardens,\n1 Marina Boulevard, Singapore 018989",
    "dress_code": "Royal — Maroon & Gold",
    "venue_map_link": "",
    "venue_map_embed_url": "",
    "itinerary_title": "Programme",
    "itinerary": [
      {"title": "Baraat", "items": [{"time": "6:00pm", "label": "Grooms procession"}]},
      {"title": "Jaimala", "items": [{"time": "7:00pm", "label": "Exchange of garlands"}]},
      {"title": "Pheras", "items": [{"time": "8:00pm", "label": "Wedding ceremony"}, {"time": "9:30pm", "label": "Royal feast"}]}
    ],
    "footnote": "A royal feast to follow",
    "rsvp_subtitle": "Your presence would honour us.",
    "rsvp_success_heading": "Dhanyavaad!",
    "rsvp_label_name": "Full Name",
    "rsvp_label_phone": "Phone Number",
    "rsvp_label_guest_count": "Number of Guests",
    "rsvp_label_message": "Message",
    "footer_tagline": "With love and grandeur,",
    "page_title": "The Wedding of Vikram & Ishani",
    "page_description": "We are honoured to invite you to celebrate our marriage.",
    "og_image": null
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.event_templates WHERE template_key = 'mughal-indian');

-- Rollback: DELETE FROM public.event_templates WHERE template_key = 'mughal-indian';
