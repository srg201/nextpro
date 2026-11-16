import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Dev only: lets a phone on the same Wi-Fi open the dev server by the Mac's LAN IP.
  allowedDevOrigins: ["192.168.0.*"],
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
        hostname: "precious-ermine-526.eu-west-1.convex.cloud",
        pathname: "/**"
      }
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
