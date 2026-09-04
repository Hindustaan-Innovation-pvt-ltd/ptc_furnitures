import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  images: {
    unoptimized: true,
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
  poweredByHeader: false,
  // Long-lived cache headers for all uploaded media + security/SEO headers
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
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // 301 Redirect non-www and www .com domain to .in
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "ptcfurnitures.com",
          },
        ],
        destination: "https://ptcfurnitures.in/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.ptcfurnitures.com",
          },
        ],
        destination: "https://ptcfurnitures.in/:path*",
        permanent: true,
      },
      // 301 Redirect www.ptcfurnitures.in to non-www canonical
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.ptcfurnitures.in",
          },
        ],
        destination: "https://ptcfurnitures.in/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    return [
      {
        source: "/upload/:path*",
        destination: "https://ptcfurnitures.in/upload/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "https://ptcfurnitures.in/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
