import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMenuSchema } from "@/lib/structured-data";
import { draftMode } from "next/headers";

export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dannysfishandchips.com";

/**
 * Food and Drink Menu page.
 *
 * Data flow: loads page blocks and renders the menu layout sections.
 * SEO: includes Menu JSON-LD schema for rich search results.
 */
export default async function MenuPage() {
  const draft = await draftMode();
  const menuData = await loaders.getFoodAndDrinkMenuData(draft.isEnabled ? { draftMode: true } : undefined);
  const data = validateApiResponse(menuData, "food and drink menu");

  const menuSchema = generateMenuSchema(SITE_URL);

  return (
    <>
      <JsonLd data={menuSchema} />
      <main>
        {renderLayoutBlocks({ blocks: data.blocks, pageContext: "menu" })}
      </main>
    </>
  );
}
