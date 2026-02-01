import qs from "qs";
import type {
  TStrapiResponse,
  THomePage,
  TGlobal,
  TMainMenu,
  TMetaData,
  TAboutUs,
  TContactUs,
  TFoodAndDrinkMenu,
  TGallery,
  THoursAndLocation,
  TSpecial,
  TSpecialDeal,
  TAnnouncement
} from "@/types";

import { api } from "@/data/data-api";
import { getStrapiURL } from "@/lib/utils";


const baseUrl = getStrapiURL();

// Standard populate configuration for pages with hero + info + reviews sections
const STANDARD_BLOCKS_POPULATE = {
  blocks: {
    on: {
      "layout.hero-section": {
        populate: {
          media: {
            populate: true,
          },
          link: {
            populate: true,
          },
        },
      },
      "layout.info-section": {
        populate: {
          features: {
            populate: {
              media: {
                populate: true,
              },
            },
          },
        },
      },
      "layout.reviews-section": {
        populate: true,
      },
    },
  },
};

// Gallery page populate configuration (hero + gallery section)
const GALLERY_BLOCKS_POPULATE = {
  blocks: {
    on: {
      "layout.hero-section": {
        populate: {
          media: {
            populate: true,
          },
          link: {
            populate: true,
          },
        },
      },
      "layout.gallery-section": {
        populate: {
          images: {
            populate: true,
          },
        },
      },
    },
  },
};

// Hours and Location page populate configuration
const HOURS_LOCATION_BLOCKS_POPULATE = {
  blocks: {
    on: {
      "layout.hero-section": {
        populate: {
          media: {
            populate: true,
          },
          link: {
            populate: true,
          },
        },
      },
      "layout.info-section": {
        populate: {
          features: {
            populate: {
              media: {
                populate: true,
              },
            },
          },
        },
      },
      "layout.location-section": {
        populate: {
          operatingHours: {
            populate: true,
          },
        },
      },
    },
  },
};

// Special page populate configuration (hero + info + deals section)
const SPECIAL_BLOCKS_POPULATE = {
  blocks: {
    on: {
      "layout.hero-section": {
        populate: {
          media: {
            populate: true,
          },
          link: {
            populate: true,
          },
        },
      },
      "layout.info-section": {
        populate: {
          features: {
            populate: {
              media: {
                populate: true,
              },
            },
          },
        },
      },
      "layout.deals-section": {
        populate: true,
      },
    },
  },
};

/**
 * Generic page data loader
 * @param endpoint - API endpoint (e.g., "home-page", "about-us")
 * @param populateConfig - Populate configuration (defaults to STANDARD_BLOCKS_POPULATE)
 */
async function loadPageData<T>(
  endpoint: string,
  populateConfig: typeof STANDARD_BLOCKS_POPULATE | typeof GALLERY_BLOCKS_POPULATE | typeof HOURS_LOCATION_BLOCKS_POPULATE | typeof SPECIAL_BLOCKS_POPULATE = STANDARD_BLOCKS_POPULATE
): Promise<TStrapiResponse<T>> {
  const query = qs.stringify({ populate: populateConfig });
  const url = new URL(`/api/${endpoint}`, baseUrl);
  url.search = query;
  return api.get<T>(url.href);
}

async function getHomePageData(): Promise<TStrapiResponse<THomePage>> {
  return loadPageData<THomePage>("home-page");
}

async function getMainMenuData(): Promise<TStrapiResponse<TMainMenu>> {
  const query = qs.stringify({
  populate: {
    MainMenuItems: {
      on: {
        "menu.dropdown": {
          populate: {
            sections: {
              populate: {
                links: {
                  populate: true,
                },
              },
            },
          },
        },
        "menu.menu-link": {
          populate:true,
        },
      },
    },
  },
});

  const url = new URL("/api/main-menu", baseUrl);
  url.search = query;
  return api.get<TMainMenu>(url.href);
}

async function getGlobalData(): Promise<TStrapiResponse<TGlobal>> {
  const query = qs.stringify({
    populate: [
      "header.logoText",
      "header.ctaButton",
      "footer.logoText",
      "footer.socialLink",
    ],
  });

  const url = new URL("/api/global", baseUrl);
  url.search = query;
  return api.get<TGlobal>(url.href);
}

async function getMetaData(): Promise<TStrapiResponse<TMetaData>> {
  const query = qs.stringify({
    fields: ["title", "description"],
  });

  const url = new URL("/api/global", baseUrl);
  url.search = query;
  return api.get<TMetaData>(url.href);
}

async function getAboutUsData(): Promise<TStrapiResponse<TAboutUs>> {
  return loadPageData<TAboutUs>("about-us");
}

async function getContactUsData(): Promise<TStrapiResponse<TContactUs>> {
  return loadPageData<TContactUs>("contact-us");
}

async function getFoodAndDrinkMenuData(): Promise<TStrapiResponse<TFoodAndDrinkMenu>> {
  return loadPageData<TFoodAndDrinkMenu>("food-and-drink-menu");
}

async function getGalleryData(): Promise<TStrapiResponse<TGallery>> {
  return loadPageData<TGallery>("gallery", GALLERY_BLOCKS_POPULATE);
}

async function getHoursAndLocationData(): Promise<TStrapiResponse<THoursAndLocation>> {
  return loadPageData<THoursAndLocation>("hours-and-location", HOURS_LOCATION_BLOCKS_POPULATE);
}

async function getSpecialData(): Promise<TStrapiResponse<TSpecial>> {
  return loadPageData<TSpecial>("special", SPECIAL_BLOCKS_POPULATE);
}

async function getSpecialDealsData(): Promise<TStrapiResponse<TSpecialDeal[]>> {
  const query = qs.stringify({
    populate: {
      image: {
        populate: true,
      },
      itemsIncluded: {
        populate: true,
      },
    },
    filters: {
      isActive: {
        $eq: true,
      },
    },
    sort: ["sortOrder:asc"],
  });

  const url = new URL("/api/special-deals", baseUrl);
  url.search = query;
  return api.get<TSpecialDeal[]>(url.href);
}

/**
 * Fetches the active announcement banner data.
 * Returns null if no announcement is active or outside date range.
 */
async function getAnnouncementData(): Promise<TAnnouncement | null> {
  const url = new URL("/api/announcement", baseUrl);
  const response = await api.get<TAnnouncement>(url.href);

  if (!response.success || !response.data) return null;

  const announcement = response.data;

  // Check if announcement is active
  if (!announcement.isActive) return null;

  // Check date range
  const now = new Date();
  if (announcement.startDate && new Date(announcement.startDate) > now) return null;
  if (announcement.endDate && new Date(announcement.endDate) < now) return null;

  return announcement;
}

/**
 * Centralized data loaders for Strapi page/content endpoints.
 *
 * Data flow: each loader builds a Strapi `populate` query and calls `api.get`,
 * returning the normalized `TStrapiResponse` used by pages/layout.
 */
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
};