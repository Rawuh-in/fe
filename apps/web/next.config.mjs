import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Setup Cloudflare dev platform for local development
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: [
    "@event-organizer/ui",
    "@event-organizer/config",
    "@event-organizer/services"
  ],
  // Disable image optimization for Cloudflare Pages
  images: {
    unoptimized: true
  }
};

export default nextConfig;
