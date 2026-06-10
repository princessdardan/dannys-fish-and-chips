import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, "../../sanity.config.ts");
const source = readFileSync(configPath, "utf8");

if (source.includes('process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"')) {
  console.error(
    "sanity.config.ts must not fall back directly to localhost for Presentation preview URLs."
  );
  process.exit(1);
}

if (!source.includes("window.location.origin")) {
  console.error(
    "sanity.config.ts should fall back to the current browser origin for embedded Studio Presentation."
  );
  process.exit(1);
}

console.log("sanity.config.ts uses a deployment-safe Presentation preview URL fallback.");
