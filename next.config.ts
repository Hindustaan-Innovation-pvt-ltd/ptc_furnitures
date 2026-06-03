// Trigger dev server reload to run the v5.0 MongoDB watermark synchronization pipeline
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // Allow static /upload/ files to be served without width restrictions
    unoptimized: false,
    formats: ["image/webp"],
  },
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
  // Add long-lived cache headers for all uploaded media
  async headers() {
    return [
      {
        source: "/upload/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

