import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "conceptafrika.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: [],
};

export default nextConfig;
