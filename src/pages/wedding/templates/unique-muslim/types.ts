import type { ThemeFieldGroup } from "../types"

export const uniqueMuslimSchema = [
  {
    title: "Couple",
    fields: [
      { key: "groom_name", label: "Groom Name", type: "text", placeholder: "e.g. Ahmad" },
      { key: "bride_name", label: "Bride Name", type: "text", placeholder: "e.g. Sarah" },
    ]
  },
  {
    title: "Typography",
    description: "Paste a Google Fonts embed URL for each role",
    descriptionUrl: "https://fonts.google.com",
    descriptionUrlLabel: "Google Fonts ↗",
    fields: [
      { key: "font_couple_url", label: "Couple Names Font", type: "text", placeholder: "https://fonts.googleapis.com/css2?family=Italianno&display=swap" },
      { key: "font_heading_url", label: "Headings Font", type: "text", placeholder: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap" },
      { key: "font_body_url", label: "Body Font", type: "text", placeholder: "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap" },
    ],
  },
  {
    title: "Hero",
    fields: [
      { key: "greeting", label: "Greeting", type: "text", placeholder: "e.g. السلام عليكم ورحمة الله وبركاته" },
      { key: "hero_divider_label", label: "Divider Label", type: "text", default: "The Wedding of", placeholder: "e.g. The Wedding of" },
      { key: "quote", label: "Quote / Verse", type: "textarea", placeholder: "e.g. And We created you in pairs." },
      { key: "quote_source", label: "Quote Source", type: "text", placeholder: "e.g. Surah An-Naba 78:8" },
    ],
  },
  {
    title: "Invitation",
    fields: [
      { key: "section_title", label: "Section Title", type: "text", placeholder: "e.g. A Journey of Love" },
      { key: "invitation_body", label: "Invitation Body", type: "textarea", placeholder: "In the name of Allah..." },
    ],
  },
  {
    title: "Blessings",
    fields: [
      { key: "blessings_prefix", label: "Section Prefix", type: "text", default: "With the blessings of", placeholder: "e.g. With the blessings of" },
      { key: "blessings_name", label: "Name", type: "textarea", placeholder: "e.g. Hj Ahmad & Hjh Ramlah" },
      { key: "blessings_label", label: "Label", type: "text", placeholder: "e.g. Parents of the Groom" },
    ],
  },
  {
    title: "Venue",
    fields: [
      { key: "date", label: "Date", type: "text", placeholder: "eg. 4th July 2026", default: "4th July 2026" },
      { key: "time", label: "Time", type: "text", placeholder: "eg. 11 am", default: "11 AM" },
      { key: "venue_name", label: "Venue Name", type: "text", placeholder: "e.g. The Grand Ballroom" },
      { key: "venue_address", label: "Venue Address", type: "textarea", placeholder: "Full address…" },
      { key: "dress_code", label: "Dress Code / Attire", type: "text", placeholder: "e.g. Traditional Malay — Shades of Green" },
      { key: "venue_map_link", label: "Map Link", type: "text", placeholder: "https://maps.google.com/…" },
      { key: "venue_map_embed_url", label: "Map Embed URL", type: "textarea", placeholder: "https://www.google.com/maps/embed?…", hint: "Paste the src URL from the Google Maps embed code — not the full <iframe> tag." },
    ],
  },
  {
    title: "RSVP",
    fields: [
      { key: "rsvp_subtitle", label: "Subtitle", type: "text", default: "Your presence would mean the world to us.", placeholder: "e.g. Your presence would mean the world to us." },
      { key: "rsvp_success_heading", label: "Success Heading", type: "text", default: "Alhamdulillah!", placeholder: "e.g. Alhamdulillah!" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { key: "footer_tagline", label: "Tagline", type: "text", default: "With love and prayers", placeholder: "e.g. With love and prayers" },
    ],
  },
  {
    title: "Visual",
    fields: [
      { key: "background_image", label: "Background Image", type: "image", placeholder: "/image.png or https://..." },
    ],
  },
] as const satisfies ThemeFieldGroup[]

type ExtractKeys<T extends readonly ThemeFieldGroup[]> =
  T[number]["fields"][number]["key"]

export type UniqueMuslimPageConfig = {
  slug: "unique-muslim"
} & {
  [K in ExtractKeys<typeof uniqueMuslimSchema>]?: string | null
}
