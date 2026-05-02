import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        manualChunks(id: string) {
          const n = id.replaceAll("\\", "/")

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
          if (n.includes("/src/pages/signup")) return "page-signup"
          if (n.includes("/src/pages/dashboard")) return "page-dashboard"
          if (n.includes("/src/pages/create-event")) return "page-create-event"
          if (n.includes("/src/pages/invitation")) return "page-invitation"
          if (n.includes("/src/pages/admin")) return "page-admin"

          if (n.includes("/src/")) return "shared"
        },
      },
    },
  },
})