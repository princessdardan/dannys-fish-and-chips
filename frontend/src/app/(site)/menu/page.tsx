import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;
export const dynamic = process.env.CI_BUILD ? 'force-dynamic' : 'auto';

export default async function MenuPage() {
  const menuData = await loaders.getFoodAndDrinkMenuData();
  const data = validateApiResponse(menuData, "food and drink menu");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "menu" })}
    </main>
  );
}
