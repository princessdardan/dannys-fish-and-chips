import type { NextConfig } from "next";

/**
 * Next.js configuration for the frontend app.
 *
 * Side effects: enables React compiler and configures remote image sources.
 */
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**/*",
      },
      {
        protocol: "https",
        hostname: "ddbwmyxekofmhitwyxoy.supabase.co",
        pathname: "/storage/v1/object/public/**/*",
      },
    ],
  },
};

export default nextConfig;
