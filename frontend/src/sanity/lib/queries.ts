import { defineQuery } from "next-sanity";

// =============================================================================
// Fragments
// =============================================================================

const linkFields = /* groq */ `
  _type,
  _key,
  href,
  label,
  isExternal
`;

const mediaFields = /* groq */ `
  image {
    asset-> {
      _id,
      url,
      mimeType,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        },
        lqip
      }
    },
    alt,
    caption,
    hotspot,
    crop
  },
  video {
    asset-> {
      _id,
      url,
      mimeType
    }
  }
`;

const seoFields = /* groq */ `
  title,
  description,
  ogImage {
    asset-> {
      _id,
      url
    }
  }
`;

const portableTextFields = /* groq */ `
  _type,
  _key,
  _type == "image" => {
    asset-> {
      _id,
      url,
      mimeType,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    alt,
    caption,
    hotspot,
    crop
  },
  _type == "block" => {
    style,
    listItem,
    markDefs[] {
      _key,
      _type,
      href
    },
    level,
    children[] {
      _type,
      _key,
      text,
      marks[]
    }
  }
`;

const infoWithMediaFields = /* groq */ `
  _type,
  _key,
  title,
  description[] {
    ${portableTextFields}
  },
  media {
    ${mediaFields}
  }
`;

const operatingHoursFields = /* groq */ `
  _type,
  _key,
  day,
  open,
  close,
  isClosed
`;

// =============================================================================
// Block Fragments
// =============================================================================

const heroBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  subHeading,
  description,
  media {
    ${mediaFields}
  },
  link {
    ${linkFields}
  },
  backgroundColor
`;

const infoBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  subHeading,
  description[] {
    ${portableTextFields}
  },
  features[] {
    ${infoWithMediaFields}
  },
  link {
    ${linkFields}
  },
  layout
`;

const galleryBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  subHeading,
  description,
  images[] {
    _type,
    _key,
    asset-> {
      _id,
      url,
      mimeType,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        },
        lqip
      }
    },
    alt,
    caption,
    hotspot,
    crop
  }
`;

const locationBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  subHeading,
  streetAddress,
  city,
  postcode,
  country,
  phoneNumber,
  googleMapsUrl,
  email,
  latitude,
  longitude,
  parkingInfo,
  // Legacy fallback fields
  address,
  phone,
  mapUrl,
  operatingHours[] {
    ${operatingHoursFields}
  }
`;

const dealsBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  subHeading,
  description
`;

const reviewsBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  subHeading,
  widgetType,
  widgetEmbedCode,
  googlePlaceId,
  tripAdvisorUrl
`;

const standfirstBlockFields = /* groq */ `
  _type,
  _key,
  heading,
  kicker,
  standfirst,
  media {
    ${mediaFields}
  },
  link {
    ${linkFields}
  },
  mediaPosition,
  variant
`;

// =============================================================================
// Page Blocks Fragment
// =============================================================================

const pageBlocks = /* groq */ `
  blocks[] {
    _type,
    _key,
    _type == "heroBlock" => {
      ${heroBlockFields}
    },
    _type == "infoBlock" => {
      ${infoBlockFields}
    },
    _type == "galleryBlock" => {
      ${galleryBlockFields}
    },
    _type == "locationBlock" => {
      ${locationBlockFields}
    },
    _type == "dealsBlock" => {
      ${dealsBlockFields}
    },
    _type == "reviewsBlock" => {
      ${reviewsBlockFields}
    },
    _type == "standfirstBlock" => {
      ${standfirstBlockFields}
    }
  }
`;

// =============================================================================
// Document Queries
// =============================================================================

/**
 * Fetch a page by slug with all blocks
 */
export const pageBySlugQuery = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug {
      current
    },
    seo {
      ${seoFields}
    },
    ${pageBlocks}
  }
`);

/**
 * Fetch the home page (slug == "home")
 */
export const homePageQuery = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == "home"][0] {
    _id,
    _type,
    title,
    slug {
      current
    },
    seo {
      ${seoFields}
    },
    ${pageBlocks}
  }
`);

/**
 * Fetch site settings (singleton with fixed ID)
 */
export const siteSettingsQuery = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id in ["siteSettings", "drafts.siteSettings"]][0] {
    _id,
    _type,
    title,
    description,
    seo {
      ${seoFields}
    },
    header {
      logoText {
        ${linkFields}
      },
      ctaButton[] {
        ${linkFields}
      }
    },
    footer {
      logoText {
        ${linkFields}
      },
      text,
      socialLink[] {
        ${linkFields}
      },
      contactEmail,
      contactPhone
    }
  }
`);

/**
 * Fetch main navigation (singleton with fixed ID)
 */
export const mainNavigationQuery = defineQuery(/* groq */ `
  *[_type == "mainNavigation" && _id in ["mainNavigation", "drafts.mainNavigation"]][0] {
    _id,
    _type,
    title,
    items[] {
      _type,
      _key,
      label,
      url,
      page-> {
        _id,
        slug {
          current
        }
      },
      isExternal,
      children[] {
        _type,
        _key,
        sectionTitle,
        links[] {
          _type,
          _key,
          ${linkFields}
        }
      }
    }
  }
`);

/**
 * Fetch the currently active announcement bar (singleton with fixed ID).
 * Filters by fixed ID, isActive, and date window.
 */
export const announcementBarQuery = defineQuery(/* groq */ `
  *[
    _type == "announcementBar" &&
    _id in ["announcementBar", "drafts.announcementBar"] &&
    isActive == true &&
    (!defined(startDate) || dateTime(startDate) <= dateTime(now())) &&
    (!defined(endDate) || dateTime(endDate) >= dateTime(now()))
  ][0] {
    _id,
    _type,
    message,
    linkText,
    linkUrl,
    backgroundColor,
    textColor,
    isActive,
    startDate,
    endDate,
    isDismissible
  }
`);

/**
 * Fetch active special deals
 */
export const specialDealsQuery = defineQuery(/* groq */ `
  *[_type == "specialDeal" && isActive == true] | order(sortOrder asc) {
    _id,
    _type,
    name,
    description,
    originalPrice,
    dealPrice,
    image {
      asset-> {
        _id,
        url,
        mimeType,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip
        }
      },
      alt,
      hotspot,
      crop
    },
    itemsIncluded[] {
      _type,
      _key,
      name,
      quantity
    },
    isActive,
    sortOrder
  }
`);

/**
 * Fetch the announcement page singleton with date-window filtering.
 */
export const announcementPageQuery = defineQuery(/* groq */ `
  *[
    _type == "announcementPage" &&
    _id in ["announcementPage", "drafts.announcementPage"] &&
    isActive == true &&
    (!defined(startDate) || dateTime(startDate) <= dateTime(now())) &&
    (!defined(endDate) || dateTime(endDate) >= dateTime(now()))
  ][0] {
    _id,
    _type,
    title,
    description,
    isActive,
    startDate,
    endDate,
    showOnHomepage,
    seo {
      ${seoFields}
    },
    blocks[] {
      _type,
      _key,
      _type == "heroBlock" => {
        ${heroBlockFields}
      },
      _type == "infoBlock" => {
        ${infoBlockFields}
      }
    }
  }
`);

/**
 * Fetch metadata (title/description) from site settings (singleton with fixed ID)
 */
export const metadataQuery = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id in ["siteSettings", "drafts.siteSettings"]][0] {
    _id,
    _type,
    title,
    description
  }
`);
