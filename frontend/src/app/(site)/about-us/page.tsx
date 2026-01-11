import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;

// In CI, use dynamic rendering to avoid build-time 404s
export const dynamic = process.env.CI_BUILD ? 'force-dynamic' : 'auto';

export default async function AboutUsPage() {
  const aboutUsData = await loaders.getAboutUsData();
  const data = validateApiResponse(aboutUsData, "about us");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "about-us" })}
    </main>
  );
}
