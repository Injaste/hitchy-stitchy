-- Migration: invitation base config — seed from the template, not '{}'.
-- =============================================================================
-- New invitations were starting with theme_config '{}' (empty), so the editor
-- fields and the saved row had no base content. Two fixes:
--   1. Give each template a real BASE CONFIG in event_templates.config (its
--      schema defaults), so the catalogue holds the editable starting point.
--   2. create_invitation now COPIES that base into theme_config on create
--      (mirrors create_theme) + validates the template exists/active.
-- The base mirrors the unique-muslim schema's field defaults; fields the couple
-- fills (names, venue, etc.) stay blank. The component still renders its own
-- fallbacks for anything absent, so a partial/stale base is safe.
-- =============================================================================

-- Comprehensive base — every schema field, realistic sample content (no slug;
-- the template is identified by template_key, config.slug is dead). Couples edit
-- their own details from here. Fonts/images blank = use the theme's defaults.
UPDATE public.event_templates
SET config = '{
  "groom_name": "Ahmad",
  "bride_name": "Sarah",
  "font_couple": null,
  "font_heading": null,
  "font_body": null,
  "greeting": "السلام عليكم ورحمة الله وبركاته",
  "hero_divider_label": "The Wedding of",
  "quote": "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has placed between you affection and mercy.",
  "quote_source": "Surah Ar-Rum 30:21",
  "section_title": "A Journey of Love",
  "invitation_body": "In the name of Allah, the Most Gracious, the Most Merciful. With hearts full of gratitude, we joyfully request the honour of your presence as we begin our journey together.",
  "blessings_prefix": "With the blessings of",
  "blessings_name": "Hj Ahmad bin Ismail & Hjh Ramlah binti Osman",
  "blessings_label": "Parents of the Groom & Bride",
  "date": "4th July 2026",
  "time": "11 AM",
  "venue_name": "The Grand Ballroom",
  "venue_address": "123 Wedding Lane, Singapore 123456",
  "dress_code": "Traditional Malay — Shades of Green",
  "venue_map_link": "",
  "venue_map_embed_url": "",
  "itinerary_title": "Programme",
  "itinerary": "Akad Nikah\n10:00 AM | Solemnization\n10:30 AM | Exchange of Vows\n\nReception\n12:00 PM | Lunch & Celebration\n3:00 PM | Photography",
  "footnote": "Meals are all Halal",
  "rsvp_subtitle": "Your presence would mean the world to us.",
  "rsvp_success_heading": "Alhamdulillah!",
  "rsvp_label_name": "Full Name",
  "rsvp_label_phone": "Phone Number",
  "rsvp_label_guest_count": "Number of Guests",
  "rsvp_label_message": "Message",
  "footer_tagline": "With love and prayers",
  "background_image": null,
  "page_title": "",
  "page_description": "",
  "og_image": null
}'::jsonb
WHERE template_key = 'unique-muslim';

CREATE OR REPLACE FUNCTION public.create_invitation(
  p_event_id uuid, p_template_key text, p_name text DEFAULT 'My Invitation'
)
RETURNS event_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_config jsonb;
  v_inv    event_invitations;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'invitation', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create an invitation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM event_invitations
    WHERE event_id = p_event_id AND day_id IS NULL AND segment_id IS NULL
  ) THEN
    RAISE EXCEPTION 'An invitation already exists for this event';
  END IF;

  -- Seed the design from the template's base config (the editable starting point).
  SELECT config INTO v_config
  FROM event_templates
  WHERE template_key = p_template_key AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  INSERT INTO event_invitations (event_id, template_key, name, theme_config)
  VALUES (
    p_event_id,
    p_template_key,
    COALESCE(NULLIF(btrim(p_name), ''), 'My Invitation'),
    COALESCE(v_config, '{}'::jsonb)
  )
  RETURNING * INTO v_inv;

  RETURN v_inv;
END;
$$;

-- Rollback:
--   restore create_invitation without the SELECT/seed (theme_config -> table default '{}').
--   event_templates.config base content can stay (harmless).
