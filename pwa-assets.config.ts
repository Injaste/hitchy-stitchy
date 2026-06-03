import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config"

// The source logo is transparent, so the maskable/apple icons need a solid
// backdrop. Match the app background (--color-background, oklch(0.99 0.013 50)).
const BACKGROUND = "#fefbf8"

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { fit: "contain", background: BACKGROUND },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { fit: "contain", background: BACKGROUND },
    },
  },
  // Source must live at the public root so generated icon paths resolve to "/"
  // (a subdir source mis-resolves icon URLs on Windows).
  images: ["public/pwa-logo.png"],
})
