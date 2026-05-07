import type { ThemeFieldGroup } from "../types"

export const uniqueMuslimSchema = [
  {
    title: "Opening",
    fields: [
      { key: "greeting", label: "Greeting", type: "text", placeholder: "e.g. السلام عليكم ورحمة الله وبركاته" },
      { key: "quote", label: "Quote / Verse", type: "textarea", placeholder: "e.g. And We created you in pairs." },
      { key: "quote_source", label: "Quote Source", type: "text", placeholder: "e.g. Surah An-Naba 78:8" },
    ],
  },
  {
    title: "Invitation",
    fields: [
      { key: "section_title", label: "Section Title", type: "text", placeholder: "e.g. A Journey of Love" },
      { key: "invitation_body", label: "Invitation Body", type: "textarea", placeholder: "In the name of Allah..." },
      { key: "attire", label: "Dress Code / Attire", type: "text", placeholder: "e.g. Traditional Malay — Shades of Green" },
    ],
  },
  {
    title: "Blessings",
    fields: [
      { key: "blessings_name", label: "Name", type: "text", placeholder: "e.g. Hj Ahmad & Hjh Ramlah" },
      { key: "blessings_label", label: "Label", type: "text", placeholder: "e.g. Parents of the Groom" },
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