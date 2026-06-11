import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { draftMode } from "next/headers";

// Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;

/**
 * Home page entry point.
 *
 * Data flow: loads home page blocks and renders them via the
 * layout block registry. Conditionally embeds announcement page blocks
 * when the announcement is active and showOnHomepage is enabled.
 * Public reads rely on sanityFetch cache/sync tags (wired to <SanityLive />).
 * Draft reads bypass cache via serverClient.fetch directly.
 */
export default async function Home() {
  const draft = await draftMode();
  const draftOpts = draft.isEnabled ? { draftMode: true } : undefined;

  const [homePageData, announcementPageData] = await Promise.all([
    loaders.getHomePageData(draftOpts),
    loaders.getAnnouncementPageData(draftOpts).then(response => {
      if (!response?.success || !response?.data) return null;
      if (!response.data.showOnHomepage) return null;
      return response.data;
    }).catch(() => null),
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
