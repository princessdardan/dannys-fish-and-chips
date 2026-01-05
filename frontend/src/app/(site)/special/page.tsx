import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { HeroSection } from "@/components/custom/layout/hero-section";
import { IHeroSectionProps, TSpecialPageBlocks } from "@/types";
import { IInfoSectionProps, InfoSection } from "@/components/custom/layout/info-section";

export const revalidate = 1800;

function blockRenderer(block: TSpecialPageBlocks, index: number) {
  switch (block.__component) {
    case "layout.hero-section":
      return <HeroSection key={index} data={block as IHeroSectionProps} />;
    case "layout.info-section":
      return <InfoSection key={index} data={block as IInfoSectionProps} />;
    default:
      return null;
  }
}

export default async function SpecialPage() {
  const specialData = await loaders.getSpecialData();
  const data = validateApiResponse(specialData, "special");
  const { blocks } = data;

  return (
    <main>
      {blocks.map((block, index) => blockRenderer(block, index))}
    </main>
  );
}
