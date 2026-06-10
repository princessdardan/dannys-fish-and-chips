import { createImageUrlBuilder } from "@sanity/image-url";

import { dataset, projectId } from "@/sanity/env";

/**
 * Sanity image URL builder configured with the project's dataset and projectId.
 *
 * Usage: urlForImage(source).width(800).url()
 */
const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Build a Sanity image URL from a Sanity image source.
 *
 * Data flow: applies auto format and fit max for sensible defaults.
 *
 * @param source - Sanity image object, asset reference, or asset ID.
 */
export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source).auto("format").fit("max");
}
