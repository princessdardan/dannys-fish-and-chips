import "server-only";

import { sanityFetch } from "@/sanity/live";
import { client } from "@/sanity/client";
import { serverClient } from "@/sanity/server-client";
import type { QueryParams } from "@sanity/client";

export const sanityClient = client;
export const sanityClientAuthenticated = serverClient;

export type FetchOptions = {
  draftMode?: boolean;
  stega?: boolean;
};

type SanityFetchOptions = {
  query: string;
  params?: QueryParams;
  perspective?: "drafts" | "published";
  stega?: boolean;
};

type SanityFetchResult<T> = {
  data: T;
  sourceMap: unknown;
  tags: string[];
};

/**
 * Resolve stega flag from options.
 * - Explicit stega option is always honored.
 * - Draft mode defaults to stega enabled (VisualEditing needs source maps).
 * - Published mode defaults to stega disabled.
 */
function resolveStega(options?: FetchOptions): boolean {
  if (typeof options?.stega === "boolean") {
    return options.stega;
  }
  return options?.draftMode ?? false;
}

/**
 * Fetch a single document from Sanity.
 *
 * Draft mode uses serverClient.fetch directly (bypassing sanityFetch cache)
 * so draft data is never cached. Published mode routes through sanityFetch
 * so <SanityLive /> can invalidate via sync tags.
 *
 * Metadata fetches should pass stega: false explicitly.
 */
export async function fetchDocument<T>(
  query: string,
  params: QueryParams = {},
  options?: FetchOptions
): Promise<T | null> {
  const stega = resolveStega(options);

  if (options?.draftMode) {
    try {
      return await serverClient.fetch<T>(query, params, {
        perspective: "drafts",
        stega,
        // Disable Next.js fetch cache for draft reads
        next: { revalidate: 0 },
      });
    } catch (error) {
      console.error("[Sanity] fetchDocument draft error:", error);
      return null;
    }
  }

  try {
    const result = await (
      sanityFetch as (opts: SanityFetchOptions) => Promise<SanityFetchResult<T>>
    )({
      query,
      params,
      perspective: "published",
      stega,
    });
    return result.data;
  } catch (error) {
    console.error("[Sanity] fetchDocument error:", error);
    return null;
  }
}

/**
 * Fetch multiple documents from Sanity.
 *
 * Draft mode uses serverClient.fetch directly; published mode routes through
 * sanityFetch for Live Content API integration.
 */
export async function fetchDocuments<T>(
  query: string,
  params: QueryParams = {},
  options?: FetchOptions
): Promise<T[]> {
  const stega = resolveStega(options);

  if (options?.draftMode) {
    try {
      return await serverClient.fetch<T[]>(query, params, {
        perspective: "drafts",
        stega,
        next: { revalidate: 0 },
      });
    } catch (error) {
      console.error("[Sanity] fetchDocuments draft error:", error);
      return [];
    }
  }

  try {
    const result = await (
      sanityFetch as (opts: SanityFetchOptions) => Promise<SanityFetchResult<T[]>>
    )({
      query,
      params,
      perspective: "published",
      stega,
    });
    return result.data;
  } catch (error) {
    console.error("[Sanity] fetchDocuments error:", error);
    return [];
  }
}
