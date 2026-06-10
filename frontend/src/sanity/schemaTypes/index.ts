import { page } from "./page";
import { siteSettings } from "./siteSettings";
import { mainNavigation } from "./mainNavigation";
import { announcementBar } from "./announcementBar";
import { specialDeal } from "./specialDeal";
import { announcementPage } from "./announcementPage";

import { seo } from "./objects/seo";
import { link } from "./objects/link";
import { media } from "./objects/media";
import { portableText } from "./objects/portableText";
import { heroBlock } from "./objects/heroBlock";
import { infoBlock } from "./objects/infoBlock";
import { infoWithMedia } from "./objects/infoWithMedia";
import { galleryBlock } from "./objects/galleryBlock";
import { locationBlock } from "./objects/locationBlock";
import { operatingHours } from "./objects/operatingHours";
import { dealsBlock } from "./objects/dealsBlock";
import { reviewsBlock } from "./objects/reviewsBlock";
import { standfirstBlock } from "./objects/standfirstBlock";

import type { SchemaTypeDefinition } from "sanity";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  page,
  siteSettings,
  mainNavigation,
  announcementBar,
  specialDeal,
  announcementPage,

  // Objects
  seo,
  link,
  media,
  portableText,
  heroBlock,
  infoBlock,
  infoWithMedia,
  galleryBlock,
  locationBlock,
  operatingHours,
  dealsBlock,
  reviewsBlock,
  standfirstBlock,
];
