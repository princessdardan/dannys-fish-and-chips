import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, "../../sanity.config.ts");
const source = readFileSync(configPath, "utf8");

const forbiddenPatterns = [
  /from\s+["']dotenv["']/,
  /require\(["']dotenv["']\)/,
  /loadEnv\s*\(/,
  /configDotenv\s*\(/,
];

const matchedPattern = forbiddenPatterns.find((pattern) => pattern.test(source));

if (matchedPattern) {
  console.error(
    `sanity.config.ts must stay browser-safe for embedded Studio; found forbidden dotenv usage: ${matchedPattern}`
  );
  process.exit(1);
}

console.log("sanity.config.ts is browser-safe for embedded Studio.");
