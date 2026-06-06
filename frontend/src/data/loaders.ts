import { fetchDocument, fetchDocuments } from "@/data/data-api";
import type { FetchOptions } from "@/data/data-api";
import {
  homePageQuery,
  pageBySlugQuery,
  siteSettingsQuery,
  mainNavigationQuery,
  announcementBarQuery,
  specialDealsQuery,
  metadataQuery,
  announcementPageQuery,
} from "@/sanity/lib/queries";
import type {
  TStrapiResponse,
  TGlobal,
  TMainMenu,
  TMetaData,
  THomePage,
  TAboutUs,
  TContactUs,
  TFoodAndDrinkMenu,
  TGallery,
  THoursAndLocation,
  TSpecial,
  TSpecialDeal,
  TAnnouncement,
  TAnnouncementPage,
} from "@/types";
import type {
  HomePageQueryResult,
  SiteSettingsQueryResult,
  MainNavigationQueryResult,
  AnnouncementBarQueryResult,
  SpecialDealsQueryResult,
  MetadataQueryResult,
  PageBySlugQueryResult,
  AnnouncementPageQueryResult,
} from "../../sanity.types";

import {
  mapToHomePage,
  mapToAboutUs,
  mapToContactUs,
  mapToFoodAndDrinkMenu,
  mapToGallery,
  mapToHoursAndLocation,
  mapToSpecial,
  mapToAnnouncementPage,
  resolveSanityImageUrl,
} from "./sanity-mappers";

// =============================================================================
// Helpers
// =============================================================================

export type LoaderOptions = FetchOptions;

function wrapSuccess<T>(data: T | null): TStrapiResponse<T> {
  if (data === null) {
    return {
      success: false,
      status: 404,
      error: {
        status: 404,
        name: "NotFoundError",
        message: "Resource not found",
      },
    };
  }
  return {
    success: true,
    status: 200,
    data,
  };
}

// =============================================================================
// Mappers (kept here for re-export and to avoid circular deps with sanity-mappers)
// =============================================================================

export function mapSiteSettingsToGlobal(
  settings: SiteSettingsQueryResult
): TGlobal | null {
  if (!settings) return null;

  const header = settings.header;
  const footer = settings.footer;

  const mapLink = (
    link: {
      _key: string | null;
      href: string | null;
      label: string | null;
      isExternal: boolean | null;
    },
    index: number
  ) => ({
    id: index,
    href: link.href || "#",
    label: link.label || "",
    isExternal: link.isExternal || false,
  });

  const logoText = header?.logoText;
  const footerLogoText = footer?.logoText;

  return {
    documentId: settings._id,
    title: settings.title || "",
    description: settings.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    header: {
      logoText: logoText
        ? {
            id: 0,
            href: logoText.href || "/",
            label: logoText.label || "Danny's Fish & Chips",
            isExternal: logoText.isExternal || false,
          }
        : {
            id: 0,
            href: "/",
            label: "Danny's Fish & Chips",
            isExternal: false,
          },
      ctaButton: header?.ctaButton?.map(mapLink) || [],
    },
    footer: {
      logoText: footerLogoText
        ? {
            id: 0,
            href: footerLogoText.href || "/",
            label: footerLogoText.label || "Danny's Fish & Chips",
            isExternal: footerLogoText.isExternal || false,
          }
        : {
            id: 0,
            href: "/",
            label: "Danny's Fish & Chips",
            isExternal: false,
          },
      text: footer?.text || "© Danny's Fish & Chips",
      socialLink: footer?.socialLink?.map(mapLink) || [],
    },
  };
}

export function mapMainNavigationToMenu(
  nav: MainNavigationQueryResult
): TMainMenu | null {
  if (!nav) return null;

  const items = nav.items || [];

  const menuItems: TMainMenu["MainMenuItems"] = items.map((item, index) => {
    const children = item.children || [];
    if (children.length > 0) {
      return {
        id: index,
        __component: "menu.dropdown" as const,
        title: item.label || "",
        sections: children.map((section, sIndex) => ({
          id: sIndex,
          documentId: section._key,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          heading: section.sectionTitle || "",
          links: (section.links || []).map((link, lIndex) => ({
            id: lIndex,
            title: link.label || "",
            url: link.href || "#",
          })),
        })),
      };
    }
    return {
      id: index,
      __component: "menu.menu-link" as const,
      title: item.label || "",
      url:
        item.url ||
        (item.page?.slug?.current
          ? `/${item.page.slug.current}`
          : "#"),
    };
  });

  return {
    id: 0,
    documentId: nav._id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    MainMenuItems: menuItems,
  };
}

export function mapAnnouncementBar(
  announcement: AnnouncementBarQueryResult
): TAnnouncement | null {
  if (!announcement) return null;

  return {
    id: 0,
    documentId: announcement._id,
    message: announcement.message || "",
    linkText: announcement.linkText || undefined,
    linkUrl: announcement.linkUrl || undefined,
    backgroundColor: announcement.backgroundColor || "#000000",
    textColor: announcement.textColor || "#ffffff",
    isActive: announcement.isActive || false,
    startDate: announcement.startDate || undefined,
    endDate: announcement.endDate || undefined,
    isDismissible: announcement.isDismissible || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}

export function mapSpecialDeal(
  deal: SpecialDealsQueryResult[number]
): TSpecialDeal {
  const imageUrl = deal.image
    ? resolveSanityImageUrl(deal.image as Record<string, unknown>, 800, 600)
    : null;

  return {
    id: 0,
    documentId: deal._id,
    name: deal.name || "",
    description: deal.description || "",
    originalPrice: deal.originalPrice || 0,
    dealPrice: deal.dealPrice || 0,
    image: imageUrl
      ? {
          id: 0,
          documentId: deal.image?.asset?._id || "",
          url: imageUrl,
          alternativeText: deal.image?.alt || null,
          caption: null,
          mime: deal.image?.asset?.mimeType || undefined,
        }
      : null,
    itemsIncluded: (deal.itemsIncluded || []).map((item, index) => ({
      id: index,
      name: item.name || "",
      quantity: item.quantity || "",
    })),
    isActive: deal.isActive,
    sortOrder: deal.sortOrder || 0,
  };
}

// =============================================================================
// Loaders
// =============================================================================

async function getHomePageData(options?: LoaderOptions): Promise<TStrapiResponse<THomePage>> {
  const data = await fetchDocument<HomePageQueryResult>(homePageQuery, {}, options);
  return wrapSuccess(data ? mapToHomePage(data) : null);
}

async function getGlobalData(options?: LoaderOptions): Promise<TStrapiResponse<TGlobal>> {
  const data = await fetchDocument<SiteSettingsQueryResult>(siteSettingsQuery, {}, options);
  const mapped = data ? mapSiteSettingsToGlobal(data) : null;
  return wrapSuccess(mapped);
}

async function getMainMenuData(options?: LoaderOptions): Promise<TStrapiResponse<TMainMenu>> {
  const data = await fetchDocument<MainNavigationQueryResult>(mainNavigationQuery, {}, options);
  const mapped = data ? mapMainNavigationToMenu(data) : null;
  return wrapSuccess(mapped);
}

async function getMetaData(options?: LoaderOptions): Promise<TStrapiResponse<TMetaData>> {
  // Metadata fields must never include stega strings
  const data = await fetchDocument<MetadataQueryResult>(metadataQuery, {}, {
    ...options,
    stega: false,
  });
  if (!data) {
    return wrapSuccess<TMetaData>(null);
  }
  const mapped: TMetaData = {
    documentId: data._id,
    title: data.title || "",
    description: data.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
  return wrapSuccess(mapped);
}

async function getAboutUsData(options?: LoaderOptions): Promise<TStrapiResponse<TAboutUs>> {
  const data = await fetchDocument<PageBySlugQueryResult>(pageBySlugQuery, { slug: "about-us" }, options);
  return wrapSuccess(data ? mapToAboutUs(data) : null);
}

async function getContactUsData(options?: LoaderOptions): Promise<TStrapiResponse<TContactUs>> {
  const data = await fetchDocument<PageBySlugQueryResult>(pageBySlugQuery, { slug: "contact-us" }, options);
  return wrapSuccess(data ? mapToContactUs(data) : null);
}

async function getFoodAndDrinkMenuData(options?: LoaderOptions): Promise<TStrapiResponse<TFoodAndDrinkMenu>> {
  const data = await fetchDocument<PageBySlugQueryResult>(pageBySlugQuery, { slug: "food-and-drink-menu" }, options);
  return wrapSuccess(data ? mapToFoodAndDrinkMenu(data) : null);
}

async function getGalleryData(options?: LoaderOptions): Promise<TStrapiResponse<TGallery>> {
  const data = await fetchDocument<PageBySlugQueryResult>(pageBySlugQuery, { slug: "gallery" }, options);
  return wrapSuccess(data ? mapToGallery(data) : null);
}

async function getHoursAndLocationData(options?: LoaderOptions): Promise<TStrapiResponse<THoursAndLocation>> {
  const data = await fetchDocument<PageBySlugQueryResult>(pageBySlugQuery, { slug: "hours-and-location" }, options);
  return wrapSuccess(data ? mapToHoursAndLocation(data) : null);
}

async function getSpecialData(options?: LoaderOptions): Promise<TStrapiResponse<TSpecial>> {
  const data = await fetchDocument<PageBySlugQueryResult>(pageBySlugQuery, { slug: "special" }, options);
  return wrapSuccess(data ? mapToSpecial(data) : null);
}

async function getSpecialDealsData(options?: LoaderOptions): Promise<TStrapiResponse<TSpecialDeal[]>> {
  const data = await fetchDocuments<SpecialDealsQueryResult[number]>(specialDealsQuery, {}, options);
  const mapped = data.map(mapSpecialDeal);
  return wrapSuccess(mapped);
}

async function getAnnouncementData(options?: LoaderOptions): Promise<TAnnouncement | null> {
  const data = await fetchDocument<AnnouncementBarQueryResult>(
    announcementBarQuery,
    {},
    options
  );
  return data ? mapAnnouncementBar(data) : null;
}

async function getAnnouncementPageData(options?: LoaderOptions): Promise<TStrapiResponse<TAnnouncementPage> | null> {
  const data = await fetchDocument<AnnouncementPageQueryResult>(announcementPageQuery, {}, options);
  const mapped = data ? mapToAnnouncementPage(data) : null;
  if (!mapped) return null;
  return wrapSuccess(mapped);
}

// =============================================================================
// Exports
// =============================================================================

export const loaders = {
  getHomePageData,
  getGlobalData,
  getMainMenuData,
  getMetaData,
  getAboutUsData,
  getContactUsData,
  getFoodAndDrinkMenuData,
  getGalleryData,
  getHoursAndLocationData,
  getSpecialData,
  getSpecialDealsData,
  getAnnouncementData,
  getAnnouncementPageData,
};
