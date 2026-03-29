import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { unstable_cache } from "next/cache";
import type { TAnnouncementPage } from "@/types";

// Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;

// Cache announcement page data for 5 minutes (time-sensitive content)
const getAnnouncementPageCached = unstable_cache(
  async (): Promise<TAnnouncementPage | null> => {
    const response = await loaders.getAnnouncementPageData();
    if (!response?.success || !response?.data) return null;
    if (!response.data.showOnHomepage) return null;
    return response.data;
  },
  ["announcement-page-homepage"],
  { revalidate: 300, tags: ["announcement-page"] }
);

/**
 * Home page entry point.
 *
 * Data flow: loads home page blocks from Strapi and renders them via the
 * layout block registry. Conditionally embeds announcement page blocks
 * when the announcement is active and showOnHomepage is enabled.
 */
export default async function Home() {
  const [homePageData, announcementPageData] = await Promise.all([
    loaders.getHomePageData(),
    getAnnouncementPageCached().catch(() => null),
  ]);

  const homeData = validateApiResponse(homePageData, "home page");

  return (
    <main>
      {renderLayoutBlocks({ blocks: homeData.blocks, pageContext: "home" })}
      {announcementPageData && announcementPageData.blocks?.length > 0 &&
        renderLayoutBlocks({
          blocks: announcementPageData.blocks,
          pageContext: "announcement",
        })}
    </main>
  );
}