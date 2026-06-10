import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";
import { draftMode } from "next/headers";

export const revalidate = 1800;

/**
 * Hours and Location page.
 *
 * Data flow: loads Strapi blocks and renders them via the shared block renderer.
 */
export default async function HoursAndLocationPage() {
  const draft = await draftMode();
  const hoursAndLocationData = await loaders.getHoursAndLocationData(draft.isEnabled ? { draftMode: true } : undefined);
  const data = validateApiResponse(hoursAndLocationData, "hours and location");

  return (
    <main>
      {renderLayoutBlocks({ blocks: data.blocks, pageContext: "hours-and-location" })}
    </main>
  );
}
