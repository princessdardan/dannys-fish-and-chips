import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;

/**
 * Contact Us page.
 *
 * Data flow: loads Strapi blocks and renders standard layout sections.
 */
export default async function ContactUsPage() {
  const contactUsData = await loaders.getContactUsData();
  const data = validateApiResponse(contactUsData, "contact us");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "contact-us" })}
    </main>
  );
}
