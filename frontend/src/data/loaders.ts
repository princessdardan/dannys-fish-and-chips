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

async function getHomePageData(): Promise<TStrapiResponse<THomePage>> {
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/home-page", baseUrl);
  url.search = query;
  return api.get<THomePage>(url.href);
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
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/about-us", baseUrl);
  url.search = query;
  return api.get<TAboutUs>(url.href);
}

async function getContactUsData(): Promise<TStrapiResponse<TContactUs>> {
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/contact-us", baseUrl);
  url.search = query;
  return api.get<TContactUs>(url.href);
}

async function getFoodAndDrinkMenuData(): Promise<TStrapiResponse<TFoodAndDrinkMenu>> {
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/food-and-drink-menu", baseUrl);
  url.search = query;
  return api.get<TFoodAndDrinkMenu>(url.href);
}

async function getGalleryData(): Promise<TStrapiResponse<TGallery>> {
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/gallery", baseUrl);
  url.search = query;
  return api.get<TGallery>(url.href);
}

async function getHoursAndLocationData(): Promise<TStrapiResponse<THoursAndLocation>> {
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/hours-and-location", baseUrl);
  url.search = query;
  return api.get<THoursAndLocation>(url.href);
}

async function getSpecialData(): Promise<TStrapiResponse<TSpecial>> {
  const query = qs.stringify({
    populate: {
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
    },
  });

  const url = new URL("/api/special", baseUrl);
  url.search = query;
  return api.get<TSpecial>(url.href);
}

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