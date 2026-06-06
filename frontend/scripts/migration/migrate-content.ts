import { createClient } from "@sanity/client";
import * as fs from "node:fs";
import * as path from "node:path";
import qs from "qs";

// =============================================================================
// Environment
// =============================================================================

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET || "staging";
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || "2024-06-01";
const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const DRY_RUN = process.env.DRY_RUN === "true";

// =============================================================================
// Validation
// =============================================================================

function validateEnv(): void {
  const missing: string[] = [];
  if (!DRY_RUN) {
    if (!SANITY_PROJECT_ID) missing.push("SANITY_PROJECT_ID");
    if (!SANITY_API_WRITE_TOKEN) missing.push("SANITY_API_WRITE_TOKEN");
  }

  if (missing.length > 0) {
    console.error(
      "[migrate-content] Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }
}

// =============================================================================
// Client
// =============================================================================

type SanityClient = ReturnType<typeof createClient>;

function createSanityClient(): SanityClient {
  validateEnv();

  return createClient({
    projectId: SANITY_PROJECT_ID!,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token: SANITY_API_WRITE_TOKEN!,
  });
}

// =============================================================================
// Types
// =============================================================================

interface AssetMapping {
  [strapiId: string]: {
    sanityAssetId: string;
    sanityUrl: string;
    strapiUrl: string;
    mime: string;
  };
}

// Strapi media file relation
interface StrapiMedia {
  id?: number;
  documentId?: string;
  url?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  mime?: string;
  width?: number;
  height?: number;
}

// Strapi blocks (Slate-like)
interface StrapiTextNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

interface StrapiLinkNode {
  type: "link";
  url: string;
  children: StrapiInlineNode[];
}

type StrapiInlineNode = StrapiTextNode | StrapiLinkNode;



// Strapi component blocks (dynamic zone)
interface StrapiComponentBlock {
  id?: number;
  documentId?: string;
  __component: string;
  [key: string]: unknown;
}

// Strapi page single types
interface StrapiPage {
  id?: number;
  documentId?: string;
  title?: string;
  description?: string;
  blocks?: StrapiComponentBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: StrapiMedia;
  };
}

interface StrapiGlobal {
  id?: number;
  documentId?: string;
  title?: string;
  description?: string;
  header?: {
    logoText?: StrapiLinkComponent;
    ctaButton?: StrapiLinkComponent[];
  };
  footer?: {
    logoText?: StrapiLinkComponent;
    text?: string;
    socialLink?: StrapiLinkComponent[];
  };
}

interface StrapiLinkComponent {
  id?: number;
  href?: string;
  label?: string;
  isExternal?: boolean;
}

interface StrapiMainMenu {
  id?: number;
  documentId?: string;
  MainMenuItems?: StrapiMenuItem[];
}

type StrapiMenuItem =
  | {
      id?: number;
      __component: "menu.menu-link";
      title?: string;
      url?: string;
    }
  | {
      id?: number;
      __component: "menu.dropdown";
      title?: string;
      sections?: Array<{
        id?: number;
        documentId?: string;
        heading?: string;
        links?: StrapiLinkComponent[];
      }>;
    };

interface StrapiAnnouncement {
  id?: number;
  documentId?: string;
  message?: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  isDismissible?: boolean;
}

interface StrapiSpecialDeal {
  id?: number;
  documentId?: string;
  name?: string;
  description?: string;
  originalPrice?: number;
  dealPrice?: number;
  image?: StrapiMedia;
  itemsIncluded?: Array<{
    id?: number;
    name?: string;
    quantity?: string;
  }>;
  isActive?: boolean;
  sortOrder?: number;
}

interface StrapiAnnouncementPage {
  id?: number;
  documentId?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  showOnHomepage?: boolean;
  blocks?: StrapiComponentBlock[];
}

// Sanity document shapes
interface SanityDocument {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

function formatMigrationError(error: unknown): string {
  if (!error) return "Unknown error";

  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    const name = typeof e.name === "string" ? e.name : undefined;
    const message = typeof e.message === "string" ? e.message : undefined;
    const statusCode = e.statusCode;
    const status = e.status;
    const statusText = e.statusText;

    const parts: string[] = [];

    if (name) parts.push(name);
    if (message) parts.push(message);

    if (typeof statusCode === "number" || typeof statusCode === "string") {
      parts.push(`statusCode=${statusCode}`);
    }
    if (typeof status === "number" || typeof status === "string") {
      parts.push(`status=${status}`);
    }
    if (typeof statusText === "string") {
      parts.push(`statusText=${statusText}`);
    }

    if (parts.length === 0) return "Unknown object error";
    return parts.join(" | ");
  }

  return String(error);
}

// =============================================================================
// Asset Mapping
// =============================================================================

function loadAssetMapping(): AssetMapping {
  const mappingPath = path.resolve(
    process.cwd(),
    "scripts",
    "migration",
    "output",
    "asset-mapping.json"
  );

  if (!fs.existsSync(mappingPath)) {
    console.warn(
      `[migrate-content] Asset mapping not found at ${mappingPath}. Content will be migrated without asset references.`
    );
    return {};
  }

  const content = fs.readFileSync(mappingPath, "utf-8");
  return JSON.parse(content) as AssetMapping;
}

// =============================================================================
// Deterministic ID helpers
// =============================================================================

function makePageId(slug: string): string {
  return `page-${slug}`;
}

function makeSpecialDealId(documentId: string): string {
  return `special-deal-${documentId}`;
}

function makeKey(prefix: string, ...parts: Array<number | string>): string {
  return `${prefix}-${parts.join("-")}`;
}

// =============================================================================
// Strapi response unwrapping helpers
// =============================================================================

function unwrapAttributes<T>(data: unknown): T {
  if (!data || typeof data !== "object") return data as T;
  const d = data as Record<string, unknown>;
  if ("attributes" in d && d.attributes !== undefined && d.attributes !== null) {
    const attributes = d.attributes as Record<string, unknown>;
    return {
      ...attributes,
      id: typeof d.id === "number" ? d.id : attributes.id,
      documentId:
        typeof d.documentId === "string" ? d.documentId : attributes.documentId,
    } as T;
  }
  return d as T;
}

function unwrapData<T>(response: unknown): T | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if ("data" in r && r.data !== undefined && r.data !== null) {
    return unwrapAttributes<T>(r.data);
  }
  return unwrapAttributes<T>(r);
}

function unwrapCollection<T>(response: unknown): T[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if ("data" in r && Array.isArray(r.data)) {
    return (r.data as unknown[]).map((item) => unwrapAttributes<T>(item));
  }
  if (Array.isArray(r)) {
    return r.map((item) => unwrapAttributes<T>(item)) as T[];
  }
  return [];
}

function getMediaAlt(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const m = media as Record<string, unknown>;
  if (typeof m.alternativeText === "string") return m.alternativeText;
  if (typeof m.alt === "string") return m.alt;
  return null;
}

function getMediaCaption(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const m = media as Record<string, unknown>;
  if (typeof m.caption === "string") return m.caption;
  return null;
}

/**
 * Unwrap a Strapi media relation which may be:
 * - a direct media object
 * - { data: mediaObject }
 * - { data: [mediaObject] } (for multiple, we take the first)
 * - null/undefined
 */
/**
 * Unwrap a Strapi media array relation which may be:
 * - an array of media objects
 * - { data: [mediaObject] }
 * - null/undefined
 */
function unwrapMediaArray(media: unknown): Record<string, unknown>[] {
  if (!media || typeof media !== "object") return [];
  const m = media as Record<string, unknown>;

  if ("data" in m) {
    const data = m.data;
    if (Array.isArray(data)) {
      return data
        .map((item) => unwrapAttributes<Record<string, unknown>>(item))
        .filter((item): item is Record<string, unknown> =>
          Boolean(item && typeof item === "object")
        );
    }
    if (data && typeof data === "object") {
      const unwrapped = unwrapAttributes<Record<string, unknown>>(data);
      return unwrapped ? [unwrapped] : [];
    }
    return [];
  }

  if (Array.isArray(m)) {
    return m.filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object")
    );
  }

  return [];
}

function unwrapMedia(media: unknown): Record<string, unknown> | undefined {
  if (!media || typeof media !== "object") return undefined;
  const m = media as Record<string, unknown>;

  // Handle { data: ... } wrapper
  if ("data" in m) {
    const data = m.data;
    if (Array.isArray(data)) {
      return data.length > 0 ? unwrapAttributes<Record<string, unknown>>(data[0]) : undefined;
    }
    if (data && typeof data === "object") {
      return unwrapAttributes<Record<string, unknown>>(data);
    }
    return undefined;
  }

  return m;
}

// =============================================================================
// Portable Text conversion
// =============================================================================

function strapiBlocksToPortableText(
  blocks: unknown,
  keyPrefix: string
): unknown[] | undefined {
  if (typeof blocks === "string") {
    const text = blocks.trim();
    if (!text) return undefined;

    return [
      {
        _type: "block",
        _key: makeKey(keyPrefix, "text"),
        style: "normal",
        children: [
          {
            _type: "span",
            _key: makeKey(keyPrefix, "text", "span"),
            text,
            marks: [],
          },
        ],
        markDefs: [],
      },
    ];
  }

  if (!blocks || !Array.isArray(blocks)) return undefined;

  const result: unknown[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as Record<string, unknown>;
    const blockKey = makeKey(keyPrefix, i);

    // Handle list blocks
    if (block.type === "list") {
      const listItems = block.children as Array<Record<string, unknown>> | undefined;
      if (!listItems) continue;

      const listItemFormat =
        block.format === "ordered" ? "number" : "bullet";

      for (let j = 0; j < listItems.length; j++) {
        const item = listItems[j];
        const itemChildren = item.children as StrapiInlineNode[] | undefined;
        if (!itemChildren) continue;

        const { children, markDefs } = convertInlineNodes(
          itemChildren,
          `${blockKey}-${j}`
        );

        result.push({
          _type: "block",
          _key: `${blockKey}-${j}`,
          style: "normal",
          listItem: listItemFormat,
          children,
          markDefs,
        });
      }
      continue;
    }

    // Determine block style
    let style = "normal";
    if (block.type === "heading") {
      const level = typeof block.level === "number" ? block.level : 2;
      style = `h${Math.min(Math.max(level, 1), 4)}`;
    } else if (block.type === "blockquote") {
      style = "blockquote";
    }

    const children = block.children as StrapiInlineNode[] | undefined;
    if (!children) continue;

    const { children: ptChildren, markDefs } = convertInlineNodes(
      children,
      blockKey
    );

    result.push({
      _type: "block",
      _key: blockKey,
      style,
      children: ptChildren,
      markDefs,
    });
  }

  return result;
}

function convertInlineNodes(
  nodes: StrapiInlineNode[],
  keyPrefix: string
): { children: unknown[]; markDefs: unknown[] } {
  const children: unknown[] = [];
  const markDefs: unknown[] = [];
  let linkIndex = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === "link") {
      const linkKey = `${keyPrefix}-link-${linkIndex++}`;
      const href = node.url || "#";

      markDefs.push({
        _key: linkKey,
        _type: "link",
        href,
      });

      // Convert link children to spans with the link mark
      const linkText = extractTextFromInlineNodes(node.children);
      children.push({
        _type: "span",
        _key: `${keyPrefix}-span-${i}`,
        text: linkText,
        marks: [linkKey],
      });
    } else {
      // Text node
      const marks: string[] = [];
      if (node.bold) marks.push("strong");
      if (node.italic) marks.push("em");

      children.push({
        _type: "span",
        _key: `${keyPrefix}-span-${i}`,
        text: node.text || "",
        marks,
      });
    }
  }

  return { children, markDefs };
}

function extractTextFromInlineNodes(nodes: StrapiInlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === "text") return n.text;
      if (n.type === "link") return extractTextFromInlineNodes(n.children);
      return "";
    })
    .join("");
}

// =============================================================================
// Media reference builders
// =============================================================================

function buildMediaRef(
  media: unknown,
  assetMapping: AssetMapping,
  keyPrefix: string
): Record<string, unknown> | undefined {
  const m = unwrapMedia(media);
  if (!m) return undefined;

  const strapiId =
    typeof m.documentId === "string"
      ? m.documentId
      : typeof m.id === "number"
        ? String(m.id)
        : undefined;

  if (!strapiId) return undefined;

  const mapped = assetMapping[strapiId];
  if (!mapped) return undefined;

  if (mapped.mime.startsWith("video/")) {
    return {
      _type: "media",
      _key: keyPrefix,
      video: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: mapped.sanityAssetId,
        },
      },
    };
  }

  if (!mapped.mime.startsWith("image/")) return undefined;

  return {
    _type: "media",
    _key: keyPrefix,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: mapped.sanityAssetId,
      },
      alt: getMediaAlt(m) || "",
      caption: getMediaCaption(m),
    },
  };
}

function buildImageRef(
  media: unknown,
  assetMapping: AssetMapping,
  keyPrefix: string
): Record<string, unknown> | undefined {
  const m = unwrapMedia(media);
  if (!m) return undefined;

  const strapiId =
    typeof m.documentId === "string"
      ? m.documentId
      : typeof m.id === "number"
        ? String(m.id)
        : undefined;

  if (!strapiId) return undefined;

  const mapped = assetMapping[strapiId];
  if (!mapped) return undefined;
  if (!mapped.mime.startsWith("image/")) return undefined;

  return {
    _type: "image",
    _key: keyPrefix,
    asset: {
      _type: "reference",
      _ref: mapped.sanityAssetId,
    },
    alt: getMediaAlt(m) || "",
    caption: getMediaCaption(m),
  };
}

function buildSeoImageRef(
  media: unknown,
  assetMapping: AssetMapping
): Record<string, unknown> | undefined {
  const m = unwrapMedia(media);
  if (!m) return undefined;

  const strapiId =
    typeof m.documentId === "string"
      ? m.documentId
      : typeof m.id === "number"
        ? String(m.id)
        : undefined;

  if (!strapiId) return undefined;

  const mapped = assetMapping[strapiId];
  if (!mapped) return undefined;
  if (!mapped.mime.startsWith("image/")) return undefined;

  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: mapped.sanityAssetId,
    },
  };
}

// =============================================================================
// Link builders
// =============================================================================

function buildLink(
  link: unknown,
  keyPrefix: string
): Record<string, unknown> | undefined {
  if (!link || typeof link !== "object") return undefined;
  const l = link as Record<string, unknown>;

  return {
    _type: "link",
    _key: keyPrefix,
    href:
      typeof l.href === "string"
        ? l.href
        : typeof l.url === "string"
          ? l.url
          : "#",
    label:
      typeof l.label === "string"
        ? l.label
        : typeof l.title === "string"
          ? l.title
          : "",
    isExternal: Boolean(l.isExternal),
  };
}

// =============================================================================
// Block transformers
// =============================================================================

function transformHeroBlock(
  block: StrapiComponentBlock,
  assetMapping: AssetMapping,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);
  const media = block.media as unknown;
  const link = block.link as unknown;

  // Strapi hero-section link is repeatable array, but Sanity expects single
  const links = Array.isArray(link) ? link : link ? [link] : [];
  const firstLink = links[0];

  return {
    _type: "heroBlock",
    _key: key,
    heading: String(block.heading || ""),
    subHeading: String(block.subHeading || ""),
    description: String(block.description || ""),
    media: buildMediaRef(media, assetMapping, `${key}-media`),
    link: buildLink(firstLink, `${key}-link`),
    backgroundColor: "default",
  };
}

function transformInfoBlock(
  block: StrapiComponentBlock,
  assetMapping: AssetMapping,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);

  const features = (block.features as unknown[] | undefined) || [];
  const link = block.link as unknown;

  return {
    _type: "infoBlock",
    _key: key,
    heading: String(block.heading || ""),
    subHeading: String(block.subHeading || ""),
    description: strapiBlocksToPortableText(block.description, `${key}-desc`),
    features: features.map((f, i) => {
      const feature = f as Record<string, unknown>;
      return {
        _type: "infoWithMedia",
        _key: makeKey("feature", blockIndex, i),
        title: String(feature.title || feature.heading || ""),
        description: strapiBlocksToPortableText(
          feature.info,
          `${key}-feature-${i}-desc`
        ),
        media: buildMediaRef(
          feature.media,
          assetMapping,
          `${key}-feature-${i}-media`
        ),
      };
    }),
    link: buildLink(link, `${key}-link`),
    layout: "standard",
  };
}

function transformGalleryBlock(
  block: StrapiComponentBlock,
  assetMapping: AssetMapping,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);
  const images = unwrapMediaArray(block.images);

  return {
    _type: "galleryBlock",
    _key: key,
    heading: String(block.heading || ""),
    subHeading: String(block.subHeading || ""),
    description: String(block.description || ""),
    images: images
      .map((img, i) =>
        buildImageRef(img, assetMapping, makeKey("gallery-img", blockIndex, i))
      )
      .filter((img): img is Record<string, unknown> => img !== undefined),
  };
}

function transformLocationBlock(
  block: StrapiComponentBlock,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);

  const operatingHours = (block.operatingHours as unknown[] | undefined) || [];

  return {
    _type: "locationBlock",
    _key: key,
    heading: String(block.heading || ""),
    subHeading: String(block.subHeading || ""),
    streetAddress: String(block.streetAddress || ""),
    city: String(block.city || ""),
    postcode: String(block.postcode || ""),
    country: String(block.country || "Canada"),
    phoneNumber: String(block.phoneNumber || ""),
    googleMapsUrl: String(block.googleMapsUrl || ""),
    email: String(block.email || ""),
    latitude: typeof block.latitude === "number" ? block.latitude : 0,
    longitude: typeof block.longitude === "number" ? block.longitude : 0,
    parkingInfo: block.parkingInfo ? String(block.parkingInfo) : undefined,
    operatingHours: operatingHours.map((oh, i) => {
      const hour = oh as Record<string, unknown>;
      return {
        _type: "operatingHours",
        _key: makeKey("oh", blockIndex, i),
        day: String(hour.day || "Monday"),
        open: hour.openTime ? String(hour.openTime) : undefined,
        close: hour.closeTime ? String(hour.closeTime) : undefined,
        isClosed: Boolean(hour.isClosed),
      };
    }),
  };
}

function transformDealsBlock(
  block: StrapiComponentBlock,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);

  return {
    _type: "dealsBlock",
    _key: key,
    heading: String(block.heading || ""),
    subHeading: String(block.subHeading || ""),
    description: String(block.description || ""),
  };
}

function transformReviewsBlock(
  block: StrapiComponentBlock,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);

  return {
    _type: "reviewsBlock",
    _key: key,
    heading: String(block.heading || ""),
    subHeading: String(block.subHeading || ""),
    widgetType: String(block.widgetType || "custom"),
    widgetEmbedCode: block.widgetEmbedCode
      ? String(block.widgetEmbedCode)
      : undefined,
    googlePlaceId: block.googlePlaceId
      ? String(block.googlePlaceId)
      : undefined,
    tripAdvisorUrl: block.tripAdvisorUrl
      ? String(block.tripAdvisorUrl)
      : undefined,
  };
}

function transformStandfirstBlock(
  block: StrapiComponentBlock,
  assetMapping: AssetMapping,
  blockIndex: number
): Record<string, unknown> {
  const key = makeKey("block", blockIndex);
  const media = block.media as unknown;
  const link = block.link as unknown;

  return {
    _type: "standfirstBlock",
    _key: key,
    heading: String(block.heading || ""),
    kicker: block.kicker ? String(block.kicker) : undefined,
    standfirst: String(block.standfirst || ""),
    media: buildMediaRef(media, assetMapping, `${key}-media`),
    link: buildLink(link, `${key}-link`),
    mediaPosition: String(block.mediaPosition || "left"),
    variant: String(block.variant || "featured"),
  };
}

function transformBlock(
  block: StrapiComponentBlock,
  assetMapping: AssetMapping,
  blockIndex: number
): Record<string, unknown> | undefined {
  switch (block.__component) {
    case "layout.hero-section":
      return transformHeroBlock(block, assetMapping, blockIndex);
    case "layout.info-section":
      return transformInfoBlock(block, assetMapping, blockIndex);
    case "layout.gallery-section":
      return transformGalleryBlock(block, assetMapping, blockIndex);
    case "layout.location-section":
      return transformLocationBlock(block, blockIndex);
    case "layout.deals-section":
      return transformDealsBlock(block, blockIndex);
    case "layout.reviews-section":
      return transformReviewsBlock(block, blockIndex);
    case "layout.standfirst-section":
      return transformStandfirstBlock(block, assetMapping, blockIndex);
    default:
      console.warn(
        `[migrate-content] Unknown block type: ${block.__component}`
      );
      return undefined;
  }
}

// =============================================================================
// Page transformers
// =============================================================================

function transformPage(
  page: StrapiPage,
  slug: string,
  assetMapping: AssetMapping
): SanityDocument {
  const blocks = (page.blocks || [])
    .map((b, i) => transformBlock(b, assetMapping, i))
    .filter((b): b is Record<string, unknown> => b !== undefined);

  const seo = page.seo;
  const seoDoc = seo
    ? {
        _type: "seo",
        title: seo.metaTitle || undefined,
        description: seo.metaDescription || undefined,
        ogImage: seo.metaImage
          ? buildSeoImageRef(seo.metaImage, assetMapping)
          : undefined,
      }
    : undefined;

  return {
    _id: makePageId(slug),
    _type: "page",
    title: page.title || slug,
    slug: {
      _type: "slug",
      current: slug,
    },
    ...(seoDoc ? { seo: seoDoc } : {}),
    blocks,
  };
}

// =============================================================================
// Singleton transformers
// =============================================================================

function transformSiteSettings(global: StrapiGlobal): SanityDocument {
  const header = global.header;
  const footer = global.footer;

  return {
    _id: "siteSettings",
    _type: "siteSettings",
    title: global.title || "Danny's Fish & Chips",
    description: global.description || "",
    header: header
      ? {
          logoText: buildLink(header.logoText, "header-logo")
            ? {
                ...buildLink(header.logoText, "header-logo"),
                _type: "link",
              }
            : undefined,
          ctaButton:
            header.ctaButton
              ?.map((l, i) => buildLink(l, `header-cta-${i}`))
              .filter((l): l is Record<string, unknown> => l !== undefined)
              .map((l) => ({ ...l, _type: "link" })) || [],
        }
      : undefined,
    footer: footer
      ? {
          logoText: buildLink(footer.logoText, "footer-logo")
            ? {
                ...buildLink(footer.logoText, "footer-logo"),
                _type: "link",
              }
            : undefined,
          text: footer.text || "© Danny's Fish & Chips",
          socialLink:
            footer.socialLink
              ?.map((l, i) => buildLink(l, `footer-social-${i}`))
              .filter((l): l is Record<string, unknown> => l !== undefined)
              .map((l) => ({ ...l, _type: "link" })) || [],
        }
      : undefined,
  };
}

function transformMainNavigation(menu: StrapiMainMenu): SanityDocument {
  const items = (menu.MainMenuItems || [])
    .map((item, i) => {
      if (item.__component === "menu.menu-link") {
        return {
          _type: "object",
          _key: makeKey("nav", i),
          label: item.title || "",
          url: item.url || "#",
          isExternal: false,
          children: [],
        };
      }

      if (item.__component === "menu.dropdown") {
        const sections = (item.sections || []).map((section, j) => ({
          _type: "object",
          _key: makeKey("nav-section", i, j),
          sectionTitle: section.heading || "",
          links:
            section.links
              ?.map((l, k) => buildLink(l, `nav-link-${i}-${j}-${k}`))
              .filter((l): l is Record<string, unknown> => l !== undefined)
              .map((l) => ({ ...l, _type: "link" })) || [],
        }));

        return {
          _type: "object",
          _key: makeKey("nav", i),
          label: item.title || "",
          url: undefined,
          isExternal: false,
          children: sections,
        };
      }

      return undefined;
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  return {
    _id: "mainNavigation",
    _type: "mainNavigation",
    title: "Main Menu",
    items,
  };
}

function transformAnnouncementBar(
  announcement: StrapiAnnouncement
): SanityDocument {
  return {
    _id: "announcementBar",
    _type: "announcementBar",
    message: announcement.message || "",
    linkText: announcement.linkText || "",
    linkUrl: announcement.linkUrl || "",
    backgroundColor: announcement.backgroundColor || "#d32f2f",
    textColor: announcement.textColor || "#ffffff",
    isActive: announcement.isActive ?? true,
    startDate: announcement.startDate || undefined,
    endDate: announcement.endDate || undefined,
    isDismissible: announcement.isDismissible ?? true,
  };
}

function transformSpecialDeal(
  deal: StrapiSpecialDeal,
  assetMapping: AssetMapping
): SanityDocument {
  const documentId = deal.documentId || String(deal.id);

  return {
    _id: makeSpecialDealId(documentId),
    _type: "specialDeal",
    name: deal.name || "",
    description: deal.description || "",
    originalPrice: deal.originalPrice || 0,
    dealPrice: deal.dealPrice || 0,
    image: deal.image
      ? buildImageRef(deal.image, assetMapping, "deal-image")
      : undefined,
    itemsIncluded:
      deal.itemsIncluded?.map((item, i) => ({
        _type: "object",
        _key: makeKey("deal-item", i),
        name: item.name || "",
        quantity: item.quantity || "",
      })) || [],
    isActive: deal.isActive ?? true,
    sortOrder: deal.sortOrder || 0,
  };
}

function transformAnnouncementPage(
  page: StrapiAnnouncementPage,
  assetMapping: AssetMapping
): SanityDocument {
  const blocks = (page.blocks || [])
    .map((b, i) => transformBlock(b, assetMapping, i))
    .filter((b): b is Record<string, unknown> => b !== undefined);

  return {
    _id: "announcementPage",
    _type: "announcementPage",
    title: page.title || "Announcement",
    description: page.description || "",
    isActive: page.isActive ?? false,
    startDate: page.startDate || undefined,
    endDate: page.endDate || undefined,
    showOnHomepage: page.showOnHomepage ?? false,
    blocks,
  };
}

// =============================================================================
// Strapi fetching
// =============================================================================

function getPopulateForEndpoint(endpoint: string): Record<string, unknown> {
  if (endpoint === "main-menu") {
    return {
      MainMenuItems: {
        on: {
          "menu.menu-link": true,
          "menu.dropdown": {
            populate: {
              sections: {
                populate: {
                  links: true,
                },
              },
            },
          },
        },
      },
    };
  }

  if (endpoint === "global") {
    return {
      header: {
        populate: {
          logoText: true,
          ctaButton: true,
        },
      },
      footer: {
        populate: {
          logoText: true,
          socialLink: true,
        },
      },
    };
  }

  if (endpoint === "announcement") {
    return "*" as unknown as Record<string, unknown>;
  }

  if (endpoint === "special-deals") {
    return {
      image: true,
      itemsIncluded: true,
    };
  }

  return {
    blocks: {
      on: {
        "layout.hero-section": {
          populate: {
            media: true,
            link: true,
          },
        },
        "layout.info-section": {
          populate: {
            features: { populate: { media: true } },
            link: true,
          },
        },
        "layout.gallery-section": {
          populate: {
            images: true,
          },
        },
        "layout.location-section": {
          populate: {
            operatingHours: true,
          },
        },
        "layout.deals-section": true,
        "layout.reviews-section": true,
        "layout.standfirst-section": {
          populate: {
            media: true,
            link: true,
          },
        },
      },
    },
  };
}

function buildStrapiUrl(endpoint: string): string {
  const url = new URL(`/api/${endpoint}`, STRAPI_URL);
  const query = qs.stringify(
    { populate: getPopulateForEndpoint(endpoint) },
    { encodeValuesOnly: true }
  );
  url.search = query;
  return url.href;
}

async function fetchStrapi<T>(endpoint: string): Promise<T | null> {
  const url = buildStrapiUrl(endpoint);

  const headers: Record<string, string> = {};
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  console.log(`[migrate-content] Fetching: ${url}`);

  const response = await fetch(url, { headers });
  if (!response.ok) {
    console.error(
      `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`
    );
    return null;
  }

  const data = (await response.json()) as unknown;
  return unwrapData<T>(data);
}

async function fetchStrapiCollection<T>(endpoint: string): Promise<T[]> {
  const url = buildStrapiUrl(endpoint);

  const headers: Record<string, string> = {};
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  console.log(`[migrate-content] Fetching collection: ${url}`);

  const response = await fetch(url, { headers });
  if (!response.ok) {
    console.error(
      `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`
    );
    return [];
  }

  const data = (await response.json()) as unknown;
  return unwrapCollection<T>(data);
}

// =============================================================================
// Sanity writing
// =============================================================================

async function writeDocuments(
  documents: SanityDocument[],
  sanityClient: SanityClient | null
): Promise<void> {
  if (DRY_RUN) {
    console.log("\n[migrate-content] DRY RUN - Would write the following documents:\n");
    for (const doc of documents) {
      console.log(`  ${doc._type} (${doc._id}):`);
      console.log(JSON.stringify(doc, null, 2).substring(0, 500) + "...\n");
    }
    return;
  }

  if (!sanityClient) {
    throw new Error("Sanity client is required when DRY_RUN is false");
  }

  const transaction = sanityClient.transaction();

  for (const doc of documents) {
    transaction.createOrReplace(doc);
  }

  await transaction.commit();
  console.log(`[migrate-content] Wrote ${documents.length} documents to Sanity`);
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  validateEnv();
  const sanityClient = DRY_RUN ? null : createSanityClient();

  console.log("[migrate-content] Starting content migration...");
  console.log(`[migrate-content] Strapi URL: ${STRAPI_URL}`);
  console.log(`[migrate-content] Sanity dataset: ${SANITY_DATASET}`);
  console.log(`[migrate-content] Dry run: ${DRY_RUN}`);

  const assetMapping = loadAssetMapping();
  console.log(
    `[migrate-content] Loaded ${Object.keys(assetMapping).length} asset mappings`
  );

  const documents: SanityDocument[] = [];

  // Fetch and transform pages
  const pages = [
    { endpoint: "home-page", slug: "home" },
    { endpoint: "about-us", slug: "about-us" },
    { endpoint: "contact-us", slug: "contact-us" },
    { endpoint: "food-and-drink-menu", slug: "food-and-drink-menu" },
    { endpoint: "gallery", slug: "gallery" },
    { endpoint: "hours-and-location", slug: "hours-and-location" },
    { endpoint: "special", slug: "special" },
  ];

  for (const { endpoint, slug } of pages) {
    const pageData = await fetchStrapi<StrapiPage>(endpoint);
    if (pageData) {
      documents.push(transformPage(pageData, slug, assetMapping));
      console.log(`[migrate-content] Transformed page: ${slug}`);
    } else {
      console.warn(`[migrate-content] No data for page: ${endpoint}`);
    }
  }

  // Fetch and transform global/site settings
  const globalData = await fetchStrapi<StrapiGlobal>("global");
  if (globalData) {
    documents.push(transformSiteSettings(globalData));
    console.log("[migrate-content] Transformed site settings");
  } else {
    console.warn("[migrate-content] No data for global settings");
  }

  // Fetch and transform main navigation
  const menuData = await fetchStrapi<StrapiMainMenu>("main-menu");
  if (menuData) {
    documents.push(transformMainNavigation(menuData));
    console.log("[migrate-content] Transformed main navigation");
  } else {
    console.warn("[migrate-content] No data for main menu");
  }

  // Fetch and transform announcement bar
  const announcementData = await fetchStrapi<StrapiAnnouncement>("announcement");
  if (announcementData) {
    documents.push(transformAnnouncementBar(announcementData));
    console.log("[migrate-content] Transformed announcement bar");
  } else {
    console.warn("[migrate-content] No data for announcement");
  }

  // Fetch and transform special deals
  const dealsData = await fetchStrapiCollection<StrapiSpecialDeal>("special-deals");
  if (dealsData.length > 0) {
    for (const deal of dealsData) {
      documents.push(transformSpecialDeal(deal, assetMapping));
    }
    console.log(`[migrate-content] Transformed ${dealsData.length} special deals`);
  } else {
    console.warn("[migrate-content] No data for special deals");
  }

  // Fetch and transform announcement page
  const announcementPageData = await fetchStrapi<StrapiAnnouncementPage>(
    "announcement-page"
  );
  if (announcementPageData) {
    documents.push(transformAnnouncementPage(announcementPageData, assetMapping));
    console.log("[migrate-content] Transformed announcement page");
  } else {
    console.warn("[migrate-content] No data for announcement page");
  }

  // Write all documents
  console.log(`[migrate-content] Total documents to write: ${documents.length}`);
  await writeDocuments(documents, sanityClient);

  console.log("[migrate-content] Migration complete!");
}

main().catch((error) => {
  console.error(
    `[migrate-content] Unrecoverable error: ${formatMigrationError(error)}`
  );
  process.exit(1);
});
