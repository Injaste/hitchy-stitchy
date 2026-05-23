import type { ThemeFieldGroup } from "../types"

export const UNIQUE_MUSLIM_FONTS = [
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Cinzel+Decorative:wght@400;700;900&display=swap",
]

export const uniqueMuslimSchema = [
  {
    title: "Couple",
    fields: [
      { key: "groom_name", label: "Groom Name", type: "text", placeholder: "e.g. Ahmad" },
      { key: "bride_name", label: "Bride Name", type: "text", placeholder: "e.g. Sarah" },
    ]
  },
  {
    title: "Hero",
    fields: [
      { key: "greeting", label: "Greeting", type: "text", placeholder: "e.g. السلام عليكم ورحمة الله وبركاته" },
      { key: "hero_divider_label", label: "Divider Label", type: "text", default: "The Wedding of", placeholder: "e.g. The Wedding of" },
      { key: "hero_cta_label", label: "CTA Button", type: "text", default: "Our Invitation", placeholder: "e.g. Our Invitation" },
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
      { key: "venue_name", label: "Venue Name", type: "text", placeholder: "e.g. The Grand Ballroom" },
      { key: "venue_address", label: "Venue Address", type: "textarea", placeholder: "Full address…" },
      { key: "venue_map_link", label: "Map Link", type: "text", placeholder: "https://maps.google.com/…" },
      { key: "venue_map_embed_url", label: "Map Embed URL", type: "textarea", placeholder: "https://www.google.com/maps/embed?…" },
      { key: "attire", label: "Dress Code / Attire", type: "text", placeholder: "e.g. Traditional Malay — Shades of Green" },
      { key: "details_rsvp_cta", label: "RSVP CTA Button", type: "text", default: "RSVP Now", placeholder: "e.g. RSVP Now" },
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
