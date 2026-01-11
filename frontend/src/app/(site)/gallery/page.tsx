import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;
export const dynamic = process.env.CI_BUILD ? 'force-dynamic' : 'auto';

export default async function GalleryPage() {
  const galleryData = await loaders.getGalleryData();
  const data = validateApiResponse(galleryData, "gallery");

  return (
    <main className="mt-28">
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "gallery" })}
    </main>
  );
}
