import type { NextConfig } from "next";

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

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
      ...(sanityProjectId
        ? [
            {
              protocol: "https" as const,
              hostname: "cdn.sanity.io",
              pathname: `/images/${sanityProjectId}/${sanityDataset}/**`,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
