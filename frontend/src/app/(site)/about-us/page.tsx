import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;

export default async function AboutUsPage() {
  const aboutUsData = await loaders.getAboutUsData();
  const data = validateApiResponse(aboutUsData, "about us");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "about-us" })}
    </main>
  );
}
