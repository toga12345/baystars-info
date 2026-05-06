import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.baystars.co.jp' },
      { protocol: 'https', hostname: '*.npb.jp' },
    ],
  },
};

export default nextConfig;
