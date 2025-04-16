import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: '/',
      destination: '/app',
    },
    {
      source: '/auth',
      destination: '/app/auth',
    },
  ],
};

export default nextConfig;