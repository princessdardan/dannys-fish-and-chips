import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import type { IDealsSectionProps } from "@/types";

export const revalidate = 1800;

/**
 * Specials page.
 *
 * Data flow:
 * 1. Fetches page blocks and active deals in parallel
 * 2. Injects deals into deals-section blocks
 * 3. Renders the enriched blocks via block renderer
 */
export default async function SpecialPage() {
  // Fetch page data and deals in parallel
  const [specialData, dealsData] = await Promise.all([
    loaders.getSpecialData(),
    loaders.getSpecialDealsData(),
  ]);

  const data = validateApiResponse(specialData, "special");
  const deals = validateApiResponse(dealsData, "special-deals");

  // Inject deals into deals-section blocks
  const enrichedBlocks = data.blocks.map((block) => {
    if (block.__component === "layout.deals-section") {
      return {
        ...block,
        deals,
      } as IDealsSectionProps;
    }
    return block;
  });

  return (
    <main>
      {renderLayoutBlocks({ blocks: enrichedBlocks, pageContext: "special" })}
    </main>
  );
}
