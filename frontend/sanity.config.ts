import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";

import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

// Placeholder defaults for CLI/schema extraction offline.
// Runtime env validation lives in src/sanity/env.ts.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "localdev";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-06-01";

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();

export default defineConfig({
  name: "default",
  title: "Danny's Fish \u0026 Chips",
  basePath: "/studio",
  projectId,
  dataset,
  apiVersion,
  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter(
        (template) =>
          !["siteSettings", "mainNavigation", "announcementBar", "announcementPage"].includes(
            template.id
          )
      ),
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    presentationTool({
      previewUrl: {
        initial: siteUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
      resolve: {
        locations: {
          page: {
            select: {
              slug: "slug.current",
              id: "_id",
            },
            resolve: (doc) => {
              const slug = doc?.slug as string | undefined;
              const id = doc?.id as string | undefined;
              if (!slug) return null;
              return {
                locations: [
                  {
                    title: "Preview",
                    href: slug === "home" ? "/" : `/${slug}`,
                  },
                  {
                    title: "Studio",
                    href: `${siteUrl}/studio/desk/page;${id}`,
                  },
                  {
                    title: "Sanity Manage",
                    href: `https://www.sanity.io/manage/project/${projectId}/datasets/${dataset}`,
                  },
                  {
                    title: "Vercel Dashboard",
                    href: "https://vercel.com/dashboard",
                  },
                  {
                    title: "GitHub",
                    href: "https://github.com/princessdardan/dannys-fish-and-chips",
                  },
                  {
                    title: "Docs",
                    href: "https://www.sanity.io/docs",
                  },
                ],
              };
            },
          },
          specialDeal: {
            locations: [
              {
                title: "Specials Page",
                href: "/special",
              },
            ],
          },
        },
      },
    }),
  ],
});
