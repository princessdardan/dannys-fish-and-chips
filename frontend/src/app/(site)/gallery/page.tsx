import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;

/**
 * Gallery page.
 *
 * Data flow: loads gallery blocks from Strapi and renders them with spacing
 * to accommodate the fixed header.
 */
export default async function GalleryPage() {
  const galleryData = await loaders.getGalleryData();
  const data = validateApiResponse(galleryData, "gallery");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "gallery" })}
    </main>
  );
}
