import type { RestaurantSchema, MenuSchema } from "@/lib/structured-data";

/**
 * JSON-LD structured data component for SEO.
 *
 * Renders a <script type="application/ld+json"> tag with the provided schema data.
 * This enables rich search results in Google and other search engines.
 */
interface JsonLdProps {
  data: RestaurantSchema | MenuSchema;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
