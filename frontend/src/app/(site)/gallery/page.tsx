import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { GallerySection } from "@/components/custom/layout/gallery-section";
import { HeroSection } from "@/components/custom/layout/hero-section";
import { TGalleryPageBlocks, IGallerySectionProps, IHeroSectionProps } from "@/types";

export const revalidate = 1800;

function blockRenderer(block: TGalleryPageBlocks, index: number) {
  switch (block.__component) {
    case "layout.hero-section":
      return <HeroSection key={index} data={block as IHeroSectionProps} />;
    case "layout.gallery-section":
      return <GallerySection key={index} data={block as IGallerySectionProps} />;
    default:
      return null;
  }
}

export default async function GalleryPage() {
  const galleryData = await loaders.getGalleryData();
  const data = validateApiResponse(galleryData, "gallery");
  const { blocks } = data;

  return (
    <main className="mt-28">
      {blocks.map((block, index) => blockRenderer(block, index))}
    </main>
  );
}
