import { notFound } from "next/navigation";
import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { draftMode } from "next/headers";

// Revalidate every 5 minutes for time-sensitive content
export const revalidate = 300;

/**
 * Announcement page.
 *
 * Data flow: loads announcement page data with time-based filtering.
 * Shows a 404 when the announcement is inactive or outside its date range.
 */
export default async function AnnouncementPage() {
  const draft = await draftMode();
  const announcementPageData = await loaders.getAnnouncementPageData(draft.isEnabled ? { draftMode: true } : undefined);

  if (!announcementPageData) {
    notFound();
  }

  const data = validateApiResponse(announcementPageData, "announcement page");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "announcement" })}
    </main>
  );
}
