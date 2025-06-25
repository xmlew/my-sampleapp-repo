import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
 allowedDevOrigins: ["*","/_next/*"]
};

export default nextConfig;
