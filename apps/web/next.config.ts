import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: [
    "@event-organizer/ui",
    "@event-organizer/config",
    "@event-organizer/services"
  ]
};

export default nextConfig;
