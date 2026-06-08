import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      pwaAssets: { config: true },
      manifest: {
        name: "Hitchy Stitchy — Wedding Invitations & Planning Suite",
        short_name: "Hitchy Stitchy",
        description:
          "Plan your perfect wedding day — beautiful digital invitations, RSVP tracking, live event tools, and everything your big day needs, all in one place.",
        theme_color: "#c71f66",
        background_color: "#fefbf8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico}"],
        globIgnores: ["pwa-logo.png"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB — admin bundle exceeds workbox 2 MB default
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lottie-web": path.resolve(__dirname, "node_modules/lottie-web/build/player/lottie_light.js"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        manualChunks(id: string) {
          const n = id.replaceAll("\\", "/")

          // NOTE: these named vendor splits are currently inert under Vite 8 /
          // Rolldown — the function-form manualChunks doesn't emit them, so the
          // big libs collapse into page-admin/shared. Only vendor-libs (the
          // catch-all) materializes. Proper fix (migrate to output.advancedChunks)
          // is tracked in docs/todo/launch.md; kept here to document intent.
          if (n.includes("node_modules/framer-motion")) return "vendor-motion"
          if (n.includes("node_modules/@supabase")) return "vendor-supabase"
          if (n.includes("node_modules/@tanstack")) return "vendor-tanstack"

          if (n.includes("node_modules/@radix-ui") ||
            n.includes("node_modules/radix-ui") ||
            n.includes("node_modules/lucide-react") ||
            n.includes("node_modules/class-variance-authority") ||
            n.includes("node_modules/clsx") ||
            n.includes("node_modules/tailwind-merge")) return "vendor-ui"

          if (n.includes("node_modules/date-fns") ||
            n.includes("node_modules/embla-carousel") ||
            n.includes("node_modules/react-day-picker")) return "vendor-misc"

          if (n.includes("node_modules/react-router") ||
            n.includes("node_modules/react-dom") ||
            n.includes("node_modules/react/")) return "vendor-react"

          if (n.includes("node_modules/")) return "vendor-libs"

          if (n.includes("/src/pages/home")) return "page-home"
          // The public auth pages (login, sign-up, reset) are small — one chunk.
          if (n.includes("/src/auth/sign-in") ||
            n.includes("/src/auth/sign-up") ||
            n.includes("/src/auth/reset-password")) return "page-auth"
          if (n.includes("/src/pages/dashboard")) return "page-dashboard"
          if (n.includes("/src/pages/admin")) return "page-admin"

          if (n.includes("/src/")) return "shared"
        },
      },
    },
  },
})