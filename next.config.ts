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
  async redirects() {
    return [
      {
        source: "/abstract-editing",
        destination: "/academic-editing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
