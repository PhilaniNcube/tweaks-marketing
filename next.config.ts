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
  serverExternalPackages: ["@react-email/render"],
};

export default nextConfig;
