// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chsmesvozsjcgrwuimld.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // ⛔ Temporarily disables type-checking for production builds
  },
};

export default nextConfig;
