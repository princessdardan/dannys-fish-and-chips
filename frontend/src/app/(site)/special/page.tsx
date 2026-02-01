import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;

/**
 * Specials page.
 *
 * Data flow: loads Strapi blocks and renders them via the block renderer.
 */
export default async function SpecialPage() {
  const specialData = await loaders.getSpecialData();
  const data = validateApiResponse(specialData, "special");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "special" })}
    </main>
  );
}
