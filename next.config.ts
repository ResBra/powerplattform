import type { NextConfig } from "next";

const isCapacitor = process.env.IS_CAPACITOR === 'true';

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {},
};

export default nextConfig;
