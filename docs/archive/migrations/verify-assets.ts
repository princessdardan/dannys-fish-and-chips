import { createClient } from "@sanity/client";
import { loadEnvConfig } from "@next/env";

// Load .env.local (and .env) the same way Next.js does at runtime
loadEnvConfig(process.cwd());

// =============================================================================
// Environment
// =============================================================================

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || "";
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || "2024-06-01";
const SANITY_API_READ_TOKEN = process.env.SANITY_API_READ_TOKEN || "";

// Configurable expected difference and tolerance via env vars.
// Default: expect exactly -1 (one duplicate deduplicated: 40 Strapi → 39 Sanity)
// Set EXPECTED_ASSET_DIFF=0 and ASSET_DIFF_TOLERANCE=0 for exact parity.
const EXPECTED_ASSET_DIFF = Number(process.env.EXPECTED_ASSET_DIFF ?? -1);
const ASSET_DIFF_TOLERANCE = Number(process.env.ASSET_DIFF_TOLERANCE ?? 0);

// =============================================================================
// Redacted logging helpers
// =============================================================================

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    // Keep protocol + hostname only; hide path, query, credentials
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return url ? "<invalid-url>" : "<not-set>";
  }
}

function log(label: string, value: string): void {
  console.log(`[verify-assets] ${label.padEnd(20)} ${value}`);
}

// =============================================================================
// Strapi
// =============================================================================

async function countStrapiMedia(): Promise<number | null> {
  if (!STRAPI_URL) {
    log("Strapi URL:", "<not-set> — skipping Strapi count");
    return null;
  }

  const url = new URL("/api/upload/files", STRAPI_URL);
  const headers: Record<string, string> = {};
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  try {
    const response = await fetch(url.href, { headers });
    if (!response.ok) {
      log("Strapi error:", `${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as unknown[] | { results: unknown[] };

    if (Array.isArray(data)) {
      return data.length;
    }
    if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
      return data.results.length;
    }
    return 0;
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error ? String((error as { status: unknown }).status) : undefined;
    const category = status ? `Request failed (HTTP ${status})` : "Request failed";
    log("Strapi fetch error:", category);
    return null;
  }
}

// =============================================================================
// Sanity
// =============================================================================

async function countSanityAssets(): Promise<number | null> {
  if (!SANITY_PROJECT_ID) {
    log("Sanity project:", "<not-set> — skipping Sanity count");
    return null;
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token: SANITY_API_READ_TOKEN || undefined,
  });

  try {
    const count = await client.fetch<number>(
      `count(*[_type in ["sanity.imageAsset", "sanity.fileAsset"]])`
    );
    return count;
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error ? String((error as { statusCode: unknown }).statusCode) : undefined;
    const category = status ? `Request failed (HTTP ${status})` : "Request failed";
    log("Sanity fetch error:", category);
    return null;
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  console.log("[verify-assets] Starting asset count verification...\n");

  // Log configuration (tokens: <set> / <not-set> only)
  log("Strapi URL:", redactUrl(STRAPI_URL));
  log("Strapi token:", STRAPI_API_TOKEN ? "<set>" : "<not-set>");
  log("Sanity project:", SANITY_PROJECT_ID || "<not-set>");
  log("Sanity dataset:", SANITY_DATASET);
  log("Sanity token:", SANITY_API_READ_TOKEN ? "<set>" : "<not-set>");
  log("Expected diff:", String(EXPECTED_ASSET_DIFF));
  log("Tolerance:", String(ASSET_DIFF_TOLERANCE));
  console.log("");

  const [strapiCount, sanityCount] = await Promise.all([
    countStrapiMedia(),
    countSanityAssets(),
  ]);

  if (strapiCount !== null) {
    log("Strapi media count:", String(strapiCount));
  }
  if (sanityCount !== null) {
    log("Sanity asset count:", String(sanityCount));
  }

  if (strapiCount !== null && sanityCount !== null) {
    const diff = sanityCount - strapiCount;
    log("Difference:", `${diff >= 0 ? "+" : ""}${diff}`);

    if (Math.abs(diff - EXPECTED_ASSET_DIFF) <= ASSET_DIFF_TOLERANCE) {
      console.log(`\n[verify-assets] Status: OK — difference ${diff} is within expected range (${EXPECTED_ASSET_DIFF} ± ${ASSET_DIFF_TOLERANCE})`);
      process.exit(0);
    } else {
      console.log(`\n[verify-assets] Status: WARNING — difference ${diff} is outside expected range (${EXPECTED_ASSET_DIFF} ± ${ASSET_DIFF_TOLERANCE})`);
      console.log(`[verify-assets] To adjust, set EXPECTED_ASSET_DIFF and ASSET_DIFF_TOLERANCE env vars.`);
      process.exit(1);
    }
  }

  if (strapiCount === null && sanityCount === null) {
    console.log("\n[verify-assets] Status: ERROR — could not reach either system");
    process.exit(1);
  }

  if (strapiCount === null) {
    console.log("\n[verify-assets] Status: PARTIAL — Sanity count available, Strapi unreachable");
    console.log("[verify-assets] If Strapi is already decommissioned, this is expected.");
  }

  if (sanityCount === null) {
    console.log("\n[verify-assets] Status: PARTIAL — Strapi count available, Sanity unreachable");
  }

  process.exit(1);
}

function logSafeError(prefix: string): void {
  // Never log the raw error object — it may contain headers, tokens, or request config.
  console.error(`[verify-assets] ${prefix}: Unexpected failure`);
}

main().catch(() => {
  logSafeError("Unexpected error");
  process.exit(1);
});
