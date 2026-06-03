import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching"
import { clientsClaim } from "workbox-core"
import { NavigationRoute, registerRoute } from "workbox-routing"
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies"
import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { ExpirationPlugin } from "workbox-expiration"

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// SPA fallback — serve index.html for all navigations except API paths
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [/^\/(rest|auth|realtime|storage|functions)\//],
  }),
)

// Google Fonts stylesheets — stale-while-revalidate
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new StaleWhileRevalidate({ cacheName: "google-fonts-stylesheets" }),
)

// Google Fonts files — cache-first, 1 year
registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
)

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  const {
    title = "Hitchy Stitchy",
    body = "",
    icon = "/pwa-192x192.png",
    badge = "/pwa-64x64.png",
    url = "/",
  } = data as { title?: string; body?: string; icon?: string; badge?: string; url?: string }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: { url },
    }),
  )
})

// Notification click — focus existing tab or open new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url: string = (event.notification.data as { url?: string })?.url ?? "/"
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => new URL(c.url).pathname === url)
        if (existing) return existing.focus()
        return self.clients.openWindow(url)
      }),
  )
})
