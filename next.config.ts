import type { NextConfig } from "next";

// Images are served from the Convex deployment this build talks to: the dev deployment
// locally (.env.local), the production one on Vercel (set by `npx convex deploy --cmd ...`).
// Allowing only that exact host is safer than "*.convex.cloud", which is shared by every Convex user.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set; it is needed to allow Convex storage images.");
}
const convexHostname = new URL(convexUrl).hostname;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Dev only: lets a phone on the same Wi-Fi open the dev server by the Mac's LAN IP.
  allowedDevOrigins: ["192.168.*"],
  experimental: {
    serverActions: {
      // Phone photos are often 3–8 MB; the default Server Action limit is 1 MB.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: convexHostname,
        // Convex file storage URLs look like /api/storage/<id>
        pathname: "/api/storage/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
