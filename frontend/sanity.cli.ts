import { config as loadEnv } from "dotenv";
import { defineCliConfig } from "sanity/cli";

loadEnv({ path: ".env.local" });

// Placeholder defaults for CLI/schema extraction offline.
// Runtime env validation lives in src/sanity/env.ts.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "localdev";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  /**
   * TypeGen configuration for `sanity typegen generate`.
   * The schema is extracted to `./schema.json` and types are
   * generated to `./sanity.types.ts`.
   */
  typegen: {
    path: "./src/**/*.{ts,tsx}",
    schema: "./schema.json",
    generates: "./sanity.types.ts",
  },
  vite: {
    build: {
      target: "esnext",
    },
  },
});
