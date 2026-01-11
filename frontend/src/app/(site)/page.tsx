import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

// Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;
export const dynamic = process.env.CI_BUILD ? 'force-dynamic' : 'auto';

export default async function Home() {
  const homePageData = await loaders.getHomePageData();
  const homeData = validateApiResponse(homePageData, "home page");

  return (
    <main>
      {renderLayoutBlocks({ blocks: homeData.blocks, pageContext: "home" })}
    </main>
  );
}