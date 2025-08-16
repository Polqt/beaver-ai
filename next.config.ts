import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ads.beaverx.ai",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
