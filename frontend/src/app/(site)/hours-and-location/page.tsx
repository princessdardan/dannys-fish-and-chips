import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;
export const dynamic = process.env.CI_BUILD ? 'force-dynamic' : 'auto';

export default async function HoursAndLocationPage() {
  const hoursAndLocationData = await loaders.getHoursAndLocationData();
  const data = validateApiResponse(hoursAndLocationData, "hours and location");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "hours-and-location" })}
    </main>
  );
}
