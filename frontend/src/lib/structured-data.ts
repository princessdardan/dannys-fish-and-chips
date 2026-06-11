import type { ILocationSectionProps, IOperatingHours } from "@/components/custom/layout/location-section";

/**
 * JSON-LD schema types for structured data
 */
export interface OpeningHoursSpec {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string;
  opens: string;
  closes: string;
}

export interface RestaurantSchema {
  "@context": "https://schema.org";
  "@type": "Restaurant";
  name: string;
  image?: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  telephone: string;
  url: string;
  servesCuisine: string[];
  priceRange: string;
  openingHoursSpecification?: OpeningHoursSpec[];
  menu?: string;
}

export interface MenuSchema {
  "@context": "https://schema.org";
  "@type": "Menu";
  name: string;
  url: string;
  hasMenuSection: {
    "@type": "MenuSection";
    name: string;
    description: string;
  }[];
}

/**
 * Converts 24h time format (HH:MM) to schema.org time format (HH:MM:SS)
 */
function formatTimeForSchema(time: string | null): string {
  if (!time) return "";
  // Ensure format is HH:MM:SS
  return time.includes(":") ? `${time}:00` : time;
}

/**
 * Generates Restaurant JSON-LD schema from location data.
 *
 * @param locationData - Location section data (can be null)
 * @param siteUrl - The site's base URL
 * @returns Restaurant schema object for JSON-LD
 */
export function generateRestaurantSchema(
  locationData: ILocationSectionProps | null,
  siteUrl: string
): RestaurantSchema {
  const baseSchema: RestaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Danny's Fish and Chips",
    servesCuisine: ["British", "Fish and Chips", "Seafood"],
    priceRange: "$$",
    url: siteUrl,
    telephone: locationData?.phoneNumber || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: locationData?.streetAddress || "",
      addressLocality: locationData?.city || "",
      postalCode: locationData?.postcode || "",
      addressCountry: locationData?.country || "Canada",
    },
    menu: `${siteUrl}/menu`,
  };

  // Add geo coordinates if available
  if (locationData?.latitude && locationData?.longitude) {
    baseSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };
  }

  // Add opening hours if available
  if (locationData?.operatingHours && locationData.operatingHours.length > 0) {
    baseSchema.openingHoursSpecification = locationData.operatingHours
      .filter((h: IOperatingHours) => !h.isClosed && h.openTime && h.closeTime)
      .map((h: IOperatingHours) => ({
        "@type": "OpeningHoursSpecification" as const,
        dayOfWeek: h.day,
        opens: formatTimeForSchema(h.openTime),
        closes: formatTimeForSchema(h.closeTime),
      }));
  }

  return baseSchema;
}

/**
 * Generates Menu JSON-LD schema.
 *
 * @param siteUrl - The site's base URL
 * @returns Menu schema object for JSON-LD
 */
export function generateMenuSchema(siteUrl: string): MenuSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Danny's Fish and Chips Menu",
    url: `${siteUrl}/menu`,
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "Fish & Chips",
        description: "Traditional British fish and chips made with fresh ingredients",
      },
      {
        "@type": "MenuSection",
        name: "Sides",
        description: "Classic sides and accompaniments",
      },
      {
        "@type": "MenuSection",
        name: "Drinks",
        description: "Beverages and refreshments",
      },
    ],
  };
}
