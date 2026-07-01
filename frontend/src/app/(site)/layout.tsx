import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { loaders } from "@/data/loaders";
import { Header } from "@/components/custom/layout/header";
import { Footer } from "@/components/custom/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { generateRestaurantSchema } from "@/lib/structured-data";

import { draftMode } from "next/headers";
import type { TGlobal, TMainMenu, THoursAndLocation, ILocationSectionProps } from "@/types";
import { Analytics } from "@vercel/analytics/next"
import { SanityLiveWrapper } from "@/components/sanity/sanity-live";
import { VisualEditingWrapper } from "@/components/sanity/visual-editing";

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
 * Build site-wide metadata with safe fallbacks.
 *
 * Data flow: requests global metadata and maps it to Next.js Metadata.
 * getMetaData() already forces stega: false internally so SEO fields are clean.
 * Side effects: network I/O via loaders.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await loaders.getMetaData();

  const title = metadata?.data?.title ?? "Danny's Fish & Chips | Barrie, ON | Since 1975";
  const description = metadata?.data?.description ?? "A Barrie favourite, Danny's Fish & Chips has served crispy battered fish and golden chips across Ontario since 1975—family-owned and made fresh.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_CA",
      siteName: "Danny's Fish & Chips",
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Root shell for the public site pages.
 *
 * Layout: renders header + main + footer and includes Vercel Analytics.
 * Data flow: loads global header/footer + menu data via loaders.
 * Public reads rely on sanityFetch cache/sync tags (wired to <SanityLive />).
 * Draft reads bypass cache and use serverClient.fetch directly.
 * Side effects: server fetches + console logging on fetch failures.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const draft = await draftMode();
  const draftOpts = draft.isEnabled ? { draftMode: true } : undefined;

  // Fetch data with fallbacks to prevent layout crashes.
  // Public reads go through sanityFetch (sync tags wired to <SanityLive />).
  // Draft reads bypass cache via serverClient.fetch directly.
  const globalData = await loaders.getGlobalData(draftOpts)
    .then(r => (r.success && r.data ? r.data : DEFAULT_GLOBAL_DATA))
    .catch(err => {
      console.error('[Layout] Failed to load global data:', err);
      return DEFAULT_GLOBAL_DATA;
    });

  const mainMenuData = await loaders.getMainMenuData(draftOpts)
    .then(r => (r.success && r.data ? r.data : DEFAULT_MENU_DATA))
    .catch(err => {
      console.error('[Layout] Failed to load menu data:', err);
      return DEFAULT_MENU_DATA;
    });

  const announcementData = await loaders.getAnnouncementData(draftOpts)
    .catch(err => {
      console.error('[Layout] Failed to load announcement data:', err);
      return null;
    });

  const hoursLocationData = await loaders.getHoursAndLocationData(draftOpts)
    .then(r => {
      if (!r.success || !r.data) return null;
      return r.data;
    })
    .catch(err => {
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
          <Header
            data={globalData?.header}
            menuItems={mainMenuData?.MainMenuItems}
            announcement={announcementData}
          />
          <main className="grow pt-16 md:pt-50">
            {children}
          </main>
          <Footer data={globalData?.footer} menuItems={mainMenuData?.MainMenuItems} />
        </div>
        <Analytics />
        <SanityLiveWrapper />
        <VisualEditingWrapper />
      </body>
    </html>
  );
}
