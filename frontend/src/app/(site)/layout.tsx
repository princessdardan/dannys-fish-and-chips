import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { loaders } from "@/data/loaders";
import { Header } from "@/components/custom/layout/header";
import { Footer } from "@/components/custom/layout/footer";
import { AnnouncementBanner } from "@/components/custom/layout/announcement-banner";
import { JsonLd } from "@/components/seo/json-ld";
import { generateRestaurantSchema } from "@/lib/structured-data";
import { validateApiResponse } from "@/lib/error-handler";
import { unstable_cache } from "next/cache";
import type { TGlobal, TMainMenu, TAnnouncement, THoursAndLocation, ILocationSectionProps } from "@/types";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

// Default fallback data when API fails
const DEFAULT_GLOBAL_DATA: TGlobal = {
  documentId: "fallback",
  title: "Danny's Fish & Chips",
  description: "Restaurant website",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  header: {
    logoText: { id: 0, href: "/", label: "Danny's Fish & Chips", isExternal: false },
    ctaButton: []
  },
  footer: {
    logoText: { id: 0, href: "/", label: "Danny's Fish & Chips", isExternal: false },
    text: "© Danny's Fish & Chips",
    socialLink: []
  }
};

const DEFAULT_MENU_DATA: TMainMenu = {
  id: 0,
  documentId: "fallback",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  MainMenuItems: []
};

// Cache global data for 1 hour (header, footer, social links)
const getGlobalDataCached = unstable_cache(
  async () => {
    const globalDataResponse = await loaders.getGlobalData();
    return validateApiResponse(globalDataResponse, "global page");
  },
  ['global-data'],
  { revalidate: 3600, tags: ['global'] }
);

// Cache main menu data for 5 minutes (navigation items)
const getMainMenuDataCached = unstable_cache(
  async () => {
    const mainMenuDataResponse = await loaders.getMainMenuData();
    return validateApiResponse(mainMenuDataResponse, "main menu");
  },
  ['main-menu-data'],
  { revalidate: 300, tags: ['menu'] }
);

// Cache announcement data for 5 minutes (allows quick updates)
const getAnnouncementDataCached = unstable_cache(
  async (): Promise<TAnnouncement | null> => {
    return loaders.getAnnouncementData();
  },
  ['announcement-data'],
  { revalidate: 300, tags: ['announcement'] }
);

// Cache hours and location data for JSON-LD schema (1 hour)
const getHoursAndLocationDataCached = unstable_cache(
  async (): Promise<THoursAndLocation | null> => {
    const response = await loaders.getHoursAndLocationData();
    if (!response.success || !response.data) return null;
    return response.data;
  },
  ['hours-location-data'],
  { revalidate: 3600, tags: ['hours-location'] }
);

/**
 * Extracts location section from hours and location page blocks.
 */
function extractLocationData(data: THoursAndLocation | null): ILocationSectionProps | null {
  if (!data?.blocks) return null;
  const locationBlock = data.blocks.find(
    (block): block is ILocationSectionProps => block.__component === "layout.location-section"
  );
  return locationBlock || null;
}

// Site URL for structured data
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dannysfishandchips.com";

/**
 * Build site-wide metadata from Strapi with safe fallbacks.
 *
 * Data flow: requests global metadata and maps it to Next.js Metadata.
 * Side effects: network I/O via loaders.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await loaders.getMetaData();

  return {
    title: metadata?.data?.title ?? "Danny's Fish & Chips | Barrie, ON | Since 1975",
    description: metadata?.data?.description ?? "A Barrie favourite, Danny’s Fish & Chips has served crispy battered fish and golden chips across Ontario since 1975—family-owned and made fresh.",
  };
}

/**
 * Root shell for the public site pages.
 *
 * Layout: renders header + main + footer and includes Vercel Analytics.
 * Data flow: loads global header/footer + menu data with cached loaders.
 * Side effects: server fetches + console logging on fetch failures.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Fetch data with fallbacks to prevent layout crashes
  const globalData = await getGlobalDataCached().catch(err => {
    console.error('[Layout] Failed to load global data:', err);
    return DEFAULT_GLOBAL_DATA;
  });

  const mainMenuData = await getMainMenuDataCached().catch(err => {
    console.error('[Layout] Failed to load menu data:', err);
    return DEFAULT_MENU_DATA;
  });

  const announcementData = await getAnnouncementDataCached().catch(err => {
    console.error('[Layout] Failed to load announcement data:', err);
    return null;
  });

  const hoursLocationData = await getHoursAndLocationDataCached().catch(err => {
    console.error('[Layout] Failed to load hours/location data:', err);
    return null;
  });

  // Generate restaurant schema for JSON-LD
  const locationData = extractLocationData(hoursLocationData);
  const restaurantSchema = generateRestaurantSchema(locationData, SITE_URL);

  return (
    <html lang="en">
      <head>
        <JsonLd data={restaurantSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <AnnouncementBanner data={announcementData} />
          <Header data={globalData?.header} menuItems={mainMenuData?.MainMenuItems} />
          <main className="grow pt-16 md:pt-50">
            {children}
          </main>
          <Footer data={globalData?.footer} />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
