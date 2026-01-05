import { HeroSection, IHeroSectionProps } from "@/components/custom/layout/hero-section";
import { IInfoSectionProps } from "@/components/custom/layout/info-section";
import { NewspaperMenuSection } from "@/components/custom/layout/newspaper-menu-section";
import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { TFoodAndDrinkMenuBlocks } from "@/types";


export const revalidate = 1800;

function blockRenderer(block: TFoodAndDrinkMenuBlocks, index: number) {
  switch (block.__component) {
    case "layout.hero-section":
      return <HeroSection key={index} data={block as IHeroSectionProps} />;
    case "layout.info-section":
      return <NewspaperMenuSection key={index} data={block as IInfoSectionProps} />;
    default:
      return null;
  }
}

export default async function MenuPage() {
  const menuData = await loaders.getFoodAndDrinkMenuData();
  const data = validateApiResponse(menuData, "food and drink menu");
  const { blocks } = data;

  return (
    <main>
      {blocks.map((block, index) => blockRenderer(block, index))}
    </main>
  );
}
