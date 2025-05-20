import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    localPatterns: [
      {
        pathname: "**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
