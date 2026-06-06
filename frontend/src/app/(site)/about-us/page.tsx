import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { draftMode } from "next/headers";

export const revalidate = 1800;

/**
 * About Us page.
 *
 * Data flow: loads page blocks from Strapi and renders via layout block renderer.
 */
export default async function AboutUsPage() {
  const draft = await draftMode();
  const aboutUsData = await loaders.getAboutUsData(draft.isEnabled ? { draftMode: true } : undefined);
  const data = validateApiResponse(aboutUsData, "about us");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "about-us" })}
    </main>
  );
}
