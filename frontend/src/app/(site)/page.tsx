import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";

import {
  HeroSection,
  type IHeroSectionProps,
} from "@/components/custom/layout/hero-section";

// Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;

// Union type of all possible block components
export type TBlocks = IHeroSectionProps ;

function blockRenderer(block: TBlocks, index: number) {
  switch (block.__component) {
    case "layout.hero-section":
      return <HeroSection key={index} data={block as IHeroSectionProps} />;
    default:
      return null;
  }
}

export default async function Home() {
  // Fetch all data in parallel to avoid sequential waterfall
  const [homePageData] = await Promise.all([
    loaders.getHomePageData(),
  ]);
  
  const homeData = validateApiResponse(homePageData, "home page");

  return (
    <main>
      {homeData.blocks.map((block, index) => blockRenderer(block, index))}
    </main>
  );
}