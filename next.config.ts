import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Other config options here */

  typescript: {
    ignoreBuildErrors: true, // Add this line to ignore TypeScript build errors
  },
};

export default nextConfig;
