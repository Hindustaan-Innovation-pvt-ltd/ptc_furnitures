import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    localPatterns: [
      {
        pathname: "/upload/**",
      },
      {
        pathname: "/uploads/**",
      },
      {
        pathname: "/*",
      },
    ],
    // Images in /upload/ are already processed WebP files — no need to restrict formats
    formats: ["image/webp"],
  },
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
  // Long-lived cache headers for all uploaded media
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
