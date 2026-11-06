import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "conceptafrika.com",
        pathname: "/**",
      },
    ],
  },

};

export default nextConfig;
