import { SanityLive } from "@/sanity/live";

/**
 * Wrapper around the configured SanityLive component from @/sanity/live.
 *
 * SanityLive is returned by defineLive and is already an async server component
 * that handles draft-mode detection and live subscription setup. We keep this
 * wrapper server-compatible so it can be rendered directly in the root layout.
 */
export function SanityLiveWrapper() {
  return <SanityLive />;
}
