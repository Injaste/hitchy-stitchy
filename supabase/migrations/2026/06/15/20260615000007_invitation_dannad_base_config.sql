-- Migration: unique-muslim base config = the real dannad reference content.
-- =============================================================================
-- The template's base config should showcase the live dannad design (Izhan &
-- Sharifah), not generic placeholder names. Pulled verbatim from the old
-- event_themes "Naddy's favourite" config and mapped to the current schema:
--   - programme stored as the structured section-list array (#5);
--   - fonts left null -> the template defaults now match dannad (couple=Tangerine,
--     heading/body=EB Garamond, number=Cinzel), so no per-config font needed;
--   - legacy keys dropped (slug, *_url fonts, hero_cta_label, attire).
-- Supersedes the …0005/…0006 base content. Also resets existing (dev) invitations
-- so the test event renders dannad too.
-- =============================================================================

UPDATE public.event_templates
SET config = '{
  "groom_name": "Izhan Danish",
  "bride_name": "Sharifah Nadhirah",
  "font_couple": null,
  "font_heading": null,
  "font_body": null,
  "greeting": "اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ\nMay peace be upon you",
  "hero_divider_label": "The Wedding of",
  "quote": "وَخَلَقْنَاكُمْ أَزْوَاجًا\nAnd we created you in pairs",
  "quote_source": "Surah An-Naba 78:8",
  "section_title": "A Celebration of Love",
  "invitation_body": "In the name of Allah, the Most Gracious, the Most Merciful. We invite you to witness the beginning of our forever. A day where two souls become one, guided by faith and bounded by love.",
  "blessings_prefix": "With the blessings of",
  "blessings_name": "Shaik Mohammed\n&\nNazreen Khan",
  "blessings_label": "Parents of the Bride",
  "date": "4th July 2026",
  "time": "10AM - 4PM",
  "venue_name": "De Hall",
  "venue_address": "De Hall, \n3 Irving Rd, #02-10, Singapore 369522",
  "dress_code": "Cultural",
  "venue_map_link": "https://maps.app.goo.gl/4crEPSVaXqiU9hCN6",
  "venue_map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d103.88669395039052!3d1.3359295260651463!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da17d761ed0b63%3A0xda2246382b76a6d2!2sDe%20Hall!5e0!3m2!1sen!2ssg!4v1779533452167!5m2!1sen!2ssg",
  "itinerary_title": "Programme",
  "itinerary": [
    {"title": "Nikah", "items": [{"time": "9:45am", "label": "To be seated"}, {"time": "10:00am", "label": "Ceremony begins"}]},
    {"title": "Welcome of Guests", "items": [{"time": "11.00am", "label": ""}]},
    {"title": "Walk-in & Photo Session", "items": [{"time": "1.00pm", "label": ""}]},
    {"title": "Cake Cutting", "items": [{"time": "2.45pm", "label": ""}]},
    {"title": "End", "items": [{"time": "4.00pm", "label": ""}]}
  ],
  "footnote": "*Prayer rooms are available",
  "rsvp_subtitle": "Your presence would mean the world to us!",
  "rsvp_success_heading": "Alhamdulillah!",
  "rsvp_label_name": "Full Name",
  "rsvp_label_phone": "Phone Number",
  "rsvp_label_guest_count": "Number of Guests",
  "rsvp_label_message": "Well Wishes",
  "footer_tagline": "With love and prayers,",
  "background_image": null,
  "page_title": "The Wedding of Izhan Danish & Sharifah Nadhirah",
  "page_description": "In the name of Allah, the Most Gracious, the Most Merciful. We invite you to witness the beginning of our forever. A day where two souls become one, guided by faith and bound by love.",
  "og_image": null
}'::jsonb
WHERE template_key = 'unique-muslim';

-- Dev reset: existing invitations off this template adopt the dannad base too.
UPDATE public.event_invitations ei
SET theme_config = et.config
FROM public.event_templates et
WHERE ei.template_key = 'unique-muslim' AND et.template_key = 'unique-muslim';

-- Rollback: not meaningful (restores nothing); re-run …0005/…0006 for the old base.
