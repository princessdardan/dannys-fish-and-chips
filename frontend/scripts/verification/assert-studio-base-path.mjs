import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, "../../sanity.config.ts");
const source = readFileSync(configPath, "utf8");

if (!/basePath\s*:\s*["']\/studio["']/.test(source)) {
  console.error(
    'sanity.config.ts must set basePath: "/studio" so Sanity does not treat /studio as a tool route.'
  );
  process.exit(1);
}

console.log('sanity.config.ts sets basePath: "/studio".');
