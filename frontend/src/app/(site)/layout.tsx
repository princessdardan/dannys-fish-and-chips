import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { loaders } from "@/data/loaders";
import { Header } from "@/components/custom/layout/header";
import { Footer } from "@/components/custom/layout/footer";
import { validateApiResponse } from "@/lib/error-handler";
import { unstable_cache } from "next/cache";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


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

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await loaders.getMetaData();

  return {
    title: metadata?.data?.title ?? "Danny's Fish & Chips | Barrie, ON | Since 1975",
    description: metadata?.data?.description ?? "A Barrie favourite, Danny’s Fish & Chips has served crispy battered fish and golden chips across Ontario since 1975—family-owned and made fresh.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const globalData = await getGlobalDataCached();
  const mainMenuData = await getMainMenuDataCached();
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <Header data={globalData?.header} menuItems={mainMenuData?.MainMenuItems} />
          <main className="grow">
            {children}
          </main>
          <Footer data={globalData?.footer} />
        </div>
      </body>
    </html>
  );
}
