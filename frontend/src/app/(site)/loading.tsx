import { PageLoadingFallback } from "@/components/ui/fallback-ui";

/**
 * Route-level loading UI for the site segment.
 *
 * Displays a skeleton placeholder while page data is fetched.
 */
export default function Loading() {
  return <PageLoadingFallback />;
}
