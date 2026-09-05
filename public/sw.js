// YERO Service Worker
// Version: 1.0.2
const CACHE_NAME = "yero-cache-v3";

const PRECACHE_ASSETS = [
  "/offline.html",
  "/site.webmanifest",
  "/logo-sm.webp",
  "/logo.webp",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Install: Cache critical core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Listen for message events (e.g. skipWaiting trigger from UI)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: Strategic routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle same-origin requests (never intercept cross-origin avatars or APIs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Never cache non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // 3. Sensitive / dynamic endpoints & Next.js RSC dynamic streams: Network-only (native browser fetch)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/auth/") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1"
  ) {
    return;
  }

  // 4. Navigation requests: Network-first, fallback to /offline.html or 503
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            return networkResponse;
          }
          const cache = await caches.open(CACHE_NAME);
          const cachedOffline = await cache.match("/offline.html");
          return cachedOffline || networkResponse;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const cachedOffline = await cache.match("/offline.html");
          if (cachedOffline) {
            return cachedOffline;
          }
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      })()
    );
    return;
  }

  // 5. Static assets (_next/static, images, fonts): Stale-while-revalidate
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".svg");

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);

          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (
                networkResponse &&
                networkResponse.status === 200 &&
                networkResponse.type === "basic"
              ) {
                cache.put(request, networkResponse.clone()).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => null);

          if (cachedResponse) {
            event.waitUntil(fetchPromise);
            return cachedResponse;
          }

          const networkResponse = await fetchPromise;
          if (networkResponse) {
            return networkResponse;
          }

          return new Response(null, { status: 404, statusText: "Not Found" });
        } catch {
          return new Response(null, { status: 404, statusText: "Not Found" });
        }
      })()
    );
    return;
  }

  // 6. Default: Network-first with cache fallback, resolving to 504 on failure
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }
        return new Response(null, { status: 504, statusText: "Gateway Timeout" });
      }
    })()
  );
});

// Push Notifications
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "YERO",
    body: "You have updates on your daily tasks.",
    url: "/",
    tag: "yero-daily-reminder",
  };


  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch {
      notificationData.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || "/icon-192.png",
    badge: notificationData.badge || "/icon-192.png",
    tag: notificationData.tag || "yero-daily-reminder",
    data: {
      url: notificationData.url || "/",
    },
    renotify: true,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationData.title, notificationOptions),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "NOTIFICATION_RECEIVED" });
        });
      }),
    ])
  );
});

// Notification Click Handler: Focus existing tab or open URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client && client.url !== targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
