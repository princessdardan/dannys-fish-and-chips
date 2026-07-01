import { draftMode } from "next/headers";
import { loaders } from "@/data/loaders";
import { validateApiResponse } from "@/lib/error-handler";
import { renderLayoutBlocks } from "@/components/ui/layout-block-renderer";

export const revalidate = 1800;

interface GenericPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic generic page route.
 *
 * Renders any Sanity `page` document by slug. Static routes under (site)
 * take precedence, so this only handles unmatched slugs such as policy pages.
 */
export default async function GenericPage({ params }: GenericPageProps) {
  const { slug } = await params;
  const draft = await draftMode();
  const pageData = await loaders.getPageDataBySlug(
    slug,
    draft.isEnabled ? { draftMode: true } : undefined
  );
  const data = validateApiResponse(pageData, slug);

  return <>{renderLayoutBlocks({ blocks: data.blocks, pageContext: slug })}</>;
}
