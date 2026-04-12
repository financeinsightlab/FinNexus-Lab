import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],

  // Remove console.* calls in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    // Serve modern image formats where supported
    formats: ['image/webp', 'image/avif'],
    // Cache optimized images for at least 60 seconds (CDN/browser)
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
