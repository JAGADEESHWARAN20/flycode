import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: '/',
      destination: '/app',
    },
  ],
};

export default nextConfig;