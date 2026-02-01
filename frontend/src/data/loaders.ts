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
  TSpecial
} from "@/types";

import { api } from "@/data/data-api";
import { getStrapiURL } from "@/lib/utils";


const baseUrl = getStrapiURL();

// Standard populate configuration for pages with hero + info sections
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

/**
 * Generic page data loader
 * @param endpoint - API endpoint (e.g., "home-page", "about-us")
 * @param populateConfig - Populate configuration (defaults to STANDARD_BLOCKS_POPULATE)
 */
async function loadPageData<T>(
  endpoint: string,
  populateConfig: typeof STANDARD_BLOCKS_POPULATE | typeof GALLERY_BLOCKS_POPULATE = STANDARD_BLOCKS_POPULATE
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
  return loadPageData<THoursAndLocation>("hours-and-location");
}

async function getSpecialData(): Promise<TStrapiResponse<TSpecial>> {
  return loadPageData<TSpecial>("special");
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
};