import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { HeroSection } from "@/components/custom/layout/hero-section";
import { IInfoSectionProps } from "@/components/custom/layout/info-section";
import { NewspaperInfoSection } from "@/components/custom/layout/newspaper-info-section";
import { IHeroSectionProps, TContactUsPageBlocks } from "@/types";

export const revalidate = 1800;

function blockRenderer(block: TContactUsPageBlocks, index: number) {
  switch (block.__component) {
    case "layout.hero-section":
      return <HeroSection key={index} data={block as IHeroSectionProps} />;
    case "layout.info-section":
      return <NewspaperInfoSection key={index} data={block as IInfoSectionProps} />;
    default:
      return null;
  }
}

export default async function ContactUsPage() {
  const contactUsData = await loaders.getContactUsData();
  const data = validateApiResponse(contactUsData, "contact us");
  const { blocks } = data;

  return (
    <main>
      {blocks.map((block, index) => blockRenderer(block, index))}
    </main>
  );
}
