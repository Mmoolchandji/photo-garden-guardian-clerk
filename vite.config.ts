import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => {
              // Only cache Supabase storage image GET requests; avoid caching opaque responses
              return url.hostname === 'ypzdjqkqwbxeolfrbodk.supabase.co' &&
                     url.pathname.includes('/storage/') &&
                     request.method === 'GET' &&
                     request.destination === 'image';
            },
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-storage-images",
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [200], // do NOT cache opaque (0)
              },
            },
          },
          {
            urlPattern: /manifest\.json$/,
            handler: "CacheFirst",
            options: {
              cacheName: "manifest-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /favicon\.ico$/,
            handler: "CacheFirst",
            options: {
              cacheName: "favicon-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/icons\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "icons-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request, url }) => {
              // Only cache GET requests to Supabase API, exclude write operations
              return url.hostname === 'ypzdjqkqwbxeolfrbodk.supabase.co' && 
                     url.pathname.startsWith('/rest/v1/') &&
                     request.method === 'GET';
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour for faster data updates
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3, // Quick fallback to cache if network is slow
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
  },
}));