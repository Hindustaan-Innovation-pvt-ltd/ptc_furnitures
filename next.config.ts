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
  },
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
