import { createClient } from "@sanity/client";
import * as fs from "node:fs";
import * as path from "node:path";

// =============================================================================
// Environment
// =============================================================================

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET || "staging";
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || "2024-06-01";
const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const DRY_RUN = process.env.DRY_RUN === "true";

// =============================================================================
// Validation
// =============================================================================

function validateEnv(): void {
  const missing: string[] = [];
  if (!DRY_RUN) {
    if (!SANITY_PROJECT_ID) missing.push("SANITY_PROJECT_ID");
    if (!SANITY_API_WRITE_TOKEN) missing.push("SANITY_API_WRITE_TOKEN");
  }

  if (missing.length > 0) {
    console.error(
      "[migrate-assets] Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }
}

// =============================================================================
// Client
// =============================================================================

type SanityClient = ReturnType<typeof createClient>;

function createSanityClient(): SanityClient {
  validateEnv();

  return createClient({
    projectId: SANITY_PROJECT_ID!,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token: SANITY_API_WRITE_TOKEN!,
  });
}

// =============================================================================
// Types
// =============================================================================

interface StrapiUploadFile {
  id: number;
  documentId?: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string | null;
  provider: string;
  provider_metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

interface AssetMappingValue {
  sanityAssetId: string;
  sanityUrl: string;
  strapiUrl: string;
  mime: string;
}

interface AssetMapping {
  [strapiId: string]: AssetMappingValue;
}

// =============================================================================
// Helpers
// =============================================================================

function getStrapiUrl(relativeOrAbsolute: string): string {
  if (relativeOrAbsolute.startsWith("http")) {
    return relativeOrAbsolute;
  }
  const base = STRAPI_URL.replace(/\/$/, "");
  const path = relativeOrAbsolute.startsWith("/")
    ? relativeOrAbsolute
    : `/${relativeOrAbsolute}`;
  return `${base}${path}`;
}

async function fetchStrapiMedia(): Promise<StrapiUploadFile[]> {
  const url = new URL("/api/upload/files", STRAPI_URL);
  const headers: Record<string, string> = {};
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const response = await fetch(url.href, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Strapi media: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as
    | StrapiUploadFile[]
    | { results: StrapiUploadFile[] };

  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && "results" in data) {
    return data.results;
  }
  return [];
}

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToSanity(
  sanityClient: SanityClient | null,
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ _id: string; url: string }> {
  const assetType = mimeType.startsWith("image/") ? "image" : "file";

  if (DRY_RUN) {
    return {
      _id: `dry-run-${assetType}-${filename}`,
      url: `https://dry-run.example/${filename}`,
    };
  }

  if (!sanityClient) {
    throw new Error("Sanity client is required when DRY_RUN is false");
  }

  const asset = await sanityClient.assets.upload(assetType, buffer, {
    filename,
    contentType: mimeType,
  });

  return { _id: asset._id, url: asset.url };
}

function formatMigrationError(error: unknown): string {
  if (!error) return "Unknown error";

  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    const name = typeof e.name === "string" ? e.name : undefined;
    const message = typeof e.message === "string" ? e.message : undefined;
    const statusCode = e.statusCode;
    const status = e.status;
    const statusText = e.statusText;

    const parts: string[] = [];

    if (name) parts.push(name);
    if (message) parts.push(message);

    if (typeof statusCode === "number" || typeof statusCode === "string") {
      parts.push(`statusCode=${statusCode}`);
    }
    if (typeof status === "number" || typeof status === "string") {
      parts.push(`status=${status}`);
    }
    if (typeof statusText === "string") {
      parts.push(`statusText=${statusText}`);
    }

    if (parts.length === 0) return "Unknown object error";
    return parts.join(" | ");
  }

  return String(error);
}

function getMappingPath(): string {
  return path.resolve(
    process.cwd(),
    "scripts",
    "migration",
    "output",
    "asset-mapping.json"
  );
}

function saveMapping(mapping: AssetMapping): void {
  const outputPath = getMappingPath();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  console.log(`[migrate-assets] Saved mapping to ${outputPath}`);
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  validateEnv();
  const sanityClient = DRY_RUN ? null : createSanityClient();

  console.log("[migrate-assets] Starting asset migration...");
  console.log(`[migrate-assets] Strapi URL: ${STRAPI_URL}`);
  console.log(`[migrate-assets] Sanity dataset: ${SANITY_DATASET}`);
  console.log(`[migrate-assets] Dry run: ${DRY_RUN}`);

  const files = await fetchStrapiMedia();
  console.log(`[migrate-assets] Found ${files.length} media files`);

  const mapping: AssetMapping = {};
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const fileUrl = getStrapiUrl(file.url);
    const key = String(file.id);

    try {
      console.log(`[migrate-assets] Processing: ${file.name} (${fileUrl})`);

      const buffer = DRY_RUN ? Buffer.alloc(0) : await downloadFile(fileUrl);
      const uploaded = await uploadToSanity(
        sanityClient,
        buffer,
        file.name,
        file.mime
      );

      mapping[key] = {
        sanityAssetId: uploaded._id,
        sanityUrl: uploaded.url,
        strapiUrl: fileUrl,
        mime: file.mime,
      };

      // Also map by documentId if available
      if (file.documentId) {
        mapping[file.documentId] = mapping[key];
      }

      successCount++;
      console.log(`[migrate-assets] Uploaded: ${file.name} -> ${uploaded._id}`);
    } catch (error) {
      failCount++;
      console.error(
        `[migrate-assets] Failed to process ${file.name}: ${formatMigrationError(error)}`
      );
      // Continue with next asset
    }
  }

  saveMapping(mapping);

  console.log(
    `[migrate-assets] Complete. Success: ${successCount}, Failed: ${failCount}`
  );

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    `[migrate-assets] Unrecoverable error: ${formatMigrationError(error)}`
  );
  process.exit(1);
});
