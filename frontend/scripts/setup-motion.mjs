import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "..", ".cache");
const TARBALL_PATH = join(CACHE_DIR, "motion-plus-2.0.2.tgz");

const PACKAGE = "motion-plus";
const VERSION = "2.0.2";

async function main() {
  if (existsSync(TARBALL_PATH)) {
    console.log(`[setup-motion] Using cached ${PACKAGE}@${VERSION}`);
    return;
  }

  const token = process.env.MOTION_DEV_TOKEN;
  if (!token) {
    console.error(
      `[setup-motion] ERROR: MOTION_DEV_TOKEN environment variable is not set.\n` +
        `Get your token from https://motion.dev and add it to your environment:\n` +
        `  export MOTION_DEV_TOKEN=your_token_here`,
    );
    process.exit(1);
  }

  const url = `https://api.motion.dev/registry.tgz?package=${PACKAGE}&version=${VERSION}&token=${token}`;

  console.log(`[setup-motion] Downloading ${PACKAGE}@${VERSION}...`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `[setup-motion] ERROR: Failed to download ${PACKAGE}@${VERSION}\n` +
        `  Status: ${response.status} ${response.statusText}\n` +
        `  Check that MOTION_DEV_TOKEN is valid.`,
    );
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(TARBALL_PATH, buffer);

  console.log(
    `[setup-motion] Cached ${PACKAGE}@${VERSION} (${buffer.length} bytes)`,
  );
}

main().catch((err) => {
  console.error(`[setup-motion] ERROR:`, err.message);
  process.exit(1);
});
