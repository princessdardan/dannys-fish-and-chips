import type {
  TImage,
  TVideo,
  TMedia,
  TLink,
  BlocksContent,
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  ImageBlock,
  InlineNode,
  TextNode,
  IHeroSectionProps,
  IInfoSectionProps,
  IGallerySectionProps,
  ILocationSectionProps,
  IOperatingHours,
  IDealsSectionProps,
  IReviewsSectionProps,
  IStandfirstSectionProps,
  LayoutBlock,
  THomePage,
  TAboutUs,
  TContactUs,
  TFoodAndDrinkMenu,
  TGallery,
  THoursAndLocation,
  TSpecial,
  TAnnouncementPage,
  TGenericPage,
} from "@/types";

import type { IInfoWithMedia } from "@/components/custom/layout/info-section";

import { urlForImage } from "@/sanity/lib/image";

import type {
  PageBySlugQueryResult,
  HomePageQueryResult,
  AnnouncementPageQueryResult,
  PortableText,
} from "../../sanity.types";

// =============================================================================
// Helpers
// =============================================================================

function makeId(index: number): number {
  return index + 1;
}

function extractPlainText(pt: PortableText | null | undefined): string {
  if (!pt || !Array.isArray(pt)) return "";
  return pt
    .filter((b): b is Extract<typeof b, { _type: "block" }> => b._type === "block")
    .flatMap((b) => b.children?.map((c) => c.text).filter(Boolean) ?? [])
    .join(" ")
    .trim();
}

/**
 * Build a crop/hotspot-aware Sanity image URL from a full image object.
 *
 * Data flow: when the image has an asset _id or _ref, passes the full object
 * (including crop/hotspot) to urlForImage so Sanity applies them. When target
 * dimensions are provided, chains .width()/.height() so hotspot-derived rect
 * params are computed. Falls back to raw asset.url only when the builder cannot
 * resolve a URL.
 */
export function resolveSanityImageUrl(
  image: Record<string, unknown>,
  targetWidth?: number,
  targetHeight?: number
): string | null {
  const asset = image.asset as Record<string, unknown> | undefined;
  if (!asset) return null;

  if (asset._id || asset._ref) {
    try {
      let builder = urlForImage(image as Parameters<typeof urlForImage>[0]);
      if (targetWidth) builder = builder.width(targetWidth);
      if (targetHeight) builder = builder.height(targetHeight);
      return builder.url();
    } catch {
      // Builder failed; fallback to raw asset.url if available.
    }
  }

  return asset.url ? String(asset.url) : null;
}

// =============================================================================
// Media mapper
// =============================================================================

function mapMedia(
  sanityMedia: unknown,
  targetWidth?: number,
  targetHeight?: number
): TMedia | undefined {
  if (!sanityMedia || typeof sanityMedia !== "object") return undefined;
  const m = sanityMedia as Record<string, unknown>;

  const image = m.image as Record<string, unknown> | undefined;
  if (image) {
    const imageUrl = resolveSanityImageUrl(image, targetWidth, targetHeight);
    if (imageUrl) {
      const asset = image.asset as Record<string, unknown> | undefined;
      return {
        id: 0,
        documentId: String(asset?._id || ""),
        url: imageUrl,
        alternativeText: (image.alt as string) || null,
        caption: (image.caption as string) || null,
        mime: (asset?.mimeType as string) || undefined,
      } as TImage;
    }
  }

  const video = m.video as Record<string, unknown> | undefined;
  if (video) {
    const asset = video.asset as Record<string, unknown> | undefined;
    if (asset?.url) {
      return {
        id: 0,
        documentId: String(asset._id || ""),
        url: String(asset.url),
        alternativeText: null,
        caption: null,
        mime: (asset.mimeType as string) || undefined,
      } as TVideo;
    }
  }

  return undefined;
}

// =============================================================================
// Link mapper
// =============================================================================

function mapLink(sanityLink: unknown, index = 0): TLink | undefined {
  if (!sanityLink || typeof sanityLink !== "object") return undefined;
  const l = sanityLink as Record<string, unknown>;
  return {
    id: index,
    href: String(l.href || "#"),
    label: String(l.label || ""),
    isExternal: Boolean(l.isExternal),
  };
}

// =============================================================================
// Portable Text → BlocksContent
// =============================================================================

const DECORATOR_MARKS = new Set(["strong", "em", "underline", "strike-through", "code"]);

function mapPortableTextToBlocksContent(
  pt: PortableText | null | undefined
): BlocksContent {
  if (!pt || !Array.isArray(pt)) return [];

  const result: BlocksContent = [];

  for (const block of pt) {
    if (block._type === "block") {
      const style = block.style || "normal";

      // Build lookup for link annotations
      const linkMap = new Map<string, string>();
      block.markDefs?.forEach((def) => {
        if (def._type === "link" && def._key && def.href) {
          linkMap.set(def._key, def.href);
        }
      });

      // Convert spans into InlineNodes, grouping link annotations
      const children: InlineNode[] = [];
      const spans = block.children?.filter((c) => c._type === "span") || [];

      for (const span of spans) {
        const marks = span.marks || [];
        const text = span.text || "";

        // Separate decorators from annotation keys
        const decorators = marks.filter((m) => DECORATOR_MARKS.has(m));
        const linkKey = marks.find((m) => linkMap.has(m));

        const textNode: TextNode = {
          type: "text",
          text,
          bold: decorators.includes("strong"),
          italic: decorators.includes("em"),
          underline: decorators.includes("underline"),
          strikethrough: decorators.includes("strike-through"),
          code: decorators.includes("code"),
        };

        if (linkKey) {
          const href = linkMap.get(linkKey) || "#";
          const last = children[children.length - 1];
          if (last?.type === "link" && last.url === href) {
            // Merge consecutive linked text into same link
            last.children.push(textNode);
          } else {
            children.push({
              type: "link",
              url: href,
              children: [textNode],
            });
          }
        } else {
          children.push(textNode);
        }
      }

      if (block.listItem) {
        const format = block.listItem === "number" ? "ordered" : "unordered";
        const listItem: ListBlock["children"][number] = {
          type: "list-item",
          children,
        };
        const last = result[result.length - 1];
        if (last?.type === "list" && last.format === format) {
          last.children.push(listItem);
        } else {
          result.push({
            type: "list",
            format,
            children: [listItem],
          });
        }
        continue;
      }

      if (style === "normal") {
        result.push({
          type: "paragraph",
          children,
        } as ParagraphBlock);
        continue;
      }

      if (style.startsWith("h")) {
        const level = parseInt(style.replace("h", ""), 10) as 1 | 2 | 3 | 4 | 5 | 6;
        if (level >= 1 && level <= 6) {
          result.push({
            type: "heading",
            level,
            children,
          } as HeadingBlock);
        }
        continue;
      }

      if (style === "blockquote") {
        result.push({
          type: "quote",
          children,
        });
        continue;
      }

      // Fallback: treat as paragraph
      result.push({
        type: "paragraph",
        children,
      } as ParagraphBlock);
    }

    if (block._type === "image") {
      const asset = block.asset as Record<string, unknown> | undefined;
      const meta = asset?.metadata as Record<string, unknown> | undefined;
      const dims = meta?.dimensions as Record<string, unknown> | undefined;
      const width = (dims?.width as number) || 800;
      const height = (dims?.height as number) || 600;
      const imageUrl = resolveSanityImageUrl(
        block as Record<string, unknown>,
        width,
        height
      );
      const url = imageUrl || "";
      const alt = String(block.alt || "");
      const caption = (block.caption as string) || null;
      result.push({
        type: "image",
        image: {
          name: alt || "image",
          alternativeText: alt || null,
          url,
          caption,
          width,
          height,
          formats: {},
          hash: "",
          ext: "",
          mime: "image/jpeg",
          size: 0,
          provider: "sanity",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        children: [{ type: "text", text: "" }],
      } as ImageBlock);
    }
  }

  return result;
}

// =============================================================================
// Block mappers
// =============================================================================

function mapHeroBlock(block: unknown, index: number, isHomePage: boolean): IHeroSectionProps {
  const b = block as Record<string, unknown>;
  const link = mapLink(b.link);
  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.hero-section",
    heading: String(b.heading || ""),
    subHeading: String(b.subHeading || ""),
    description: String(b.description || ""),
    media: mapMedia(b.media, 1600, 900),
    link: link ? [link] : [],
    onHomepage: isHomePage,
  };
}

function mapInfoWithMedia(feature: unknown, index: number): IInfoWithMedia {
  const f = feature as Record<string, unknown>;
  return {
    id: makeId(index),
    heading: String(f.title || ""),
    media: mapMedia(f.media, 800, 600) as TMedia,
    info: mapPortableTextToBlocksContent(f.description as PortableText),
    orientation: "MEDIA_LEFT",
  };
}

function mapInfoBlock(block: unknown, index: number): IInfoSectionProps {
  const b = block as Record<string, unknown>;
  const link = mapLink(b.link);
  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.info-section",
    heading: String(b.heading || ""),
    subHeading: String(b.subHeading || ""),
    description: extractPlainText(b.description as PortableText),
    features:
      (b.features as unknown[] | undefined)?.map((f, i) => mapInfoWithMedia(f, i)) || [],
    link,
  };
}

function mapGalleryBlock(block: unknown, index: number): IGallerySectionProps {
  const b = block as Record<string, unknown>;
  const images = (b.images as unknown[] | undefined) || [];
  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.gallery-section",
    heading: String(b.heading || ""),
    subHeading: String(b.subHeading || ""),
    description: String(b.description || ""),
    images: images.map((img, i) => {
      const image = img as Record<string, unknown>;
      const asset = image.asset as Record<string, unknown> | undefined;
      const imageUrl = resolveSanityImageUrl(image, 800, 600);
      return {
        id: makeId(i),
        documentId: String(asset?._id || image._key || ""),
        url: imageUrl || "",
        alternativeText: (image.alt as string) || null,
        caption: (image.caption as string) || null,
        mime: (asset?.mimeType as string) || undefined,
      };
    }),
  };
}

function mapOperatingHours(oh: unknown, index: number): IOperatingHours {
  const o = oh as Record<string, unknown>;
  return {
    id: makeId(index),
    day: String(o.day || "Monday") as IOperatingHours["day"],
    openTime: o.open ? String(o.open) : null,
    closeTime: o.close ? String(o.close) : null,
    isClosed: Boolean(o.isClosed),
  };
}

function mapLocationBlock(block: unknown, index: number): ILocationSectionProps {
  const b = block as Record<string, unknown>;

  // Prefer explicit fields; fallback to legacy comma-delimited address parsing
  // only when explicit fields are absent (migration compatibility).
  const explicitStreet = b.streetAddress ? String(b.streetAddress) : "";
  const explicitCity = b.city ? String(b.city) : "";
  const explicitPostcode = b.postcode ? String(b.postcode) : "";
  const explicitCountry = b.country ? String(b.country) : "";

  let streetAddress = explicitStreet;
  let city = explicitCity;
  let postcode = explicitPostcode;
  let country = explicitCountry;

  // Legacy fallback: parse comma-delimited address only if no explicit fields present
  if (!streetAddress && !city && !postcode && b.address) {
    const addressLines = String(b.address).split(",").map((s) => s.trim());
    streetAddress = addressLines[0] || "";
    city = addressLines[1] || "";
    postcode = addressLines[2] || "";
    country = addressLines[3] || "Canada";
  }

  // Default country if still empty
  if (!country) country = "Canada";

  // Prefer explicit phoneNumber / googleMapsUrl; fallback to legacy phone / mapUrl
  const phoneNumber = b.phoneNumber
    ? String(b.phoneNumber)
    : b.phone
      ? String(b.phone)
      : "";
  const googleMapsUrl = b.googleMapsUrl
    ? String(b.googleMapsUrl)
    : b.mapUrl
      ? String(b.mapUrl)
      : undefined;

  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.location-section",
    heading: String(b.heading || ""),
    subHeading: String(b.subHeading || ""),
    streetAddress,
    city,
    postcode,
    country,
    phoneNumber,
    latitude: typeof b.latitude === "number" ? b.latitude : 0,
    longitude: typeof b.longitude === "number" ? b.longitude : 0,
    googleMapsUrl,
    operatingHours:
      (b.operatingHours as unknown[] | undefined)?.map((oh, i) =>
        mapOperatingHours(oh, i)
      ) || [],
    parkingInfo: b.parkingInfo ? String(b.parkingInfo) : undefined,
  };
}

function mapDealsBlock(block: unknown, index: number): IDealsSectionProps {
  const b = block as Record<string, unknown>;
  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.deals-section",
    heading: String(b.heading || ""),
    subHeading: String(b.subHeading || ""),
    description: String(b.description || ""),
    deals: undefined,
  };
}

function mapReviewsBlock(block: unknown, index: number): IReviewsSectionProps {
  const b = block as Record<string, unknown>;
  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.reviews-section",
    heading: String(b.heading || ""),
    subHeading: String(b.subHeading || ""),
    widgetType: String(b.widgetType || "custom") as IReviewsSectionProps["widgetType"],
    widgetEmbedCode: b.widgetEmbedCode ? String(b.widgetEmbedCode) : undefined,
    googlePlaceId: b.googlePlaceId ? String(b.googlePlaceId) : undefined,
    tripAdvisorUrl: b.tripAdvisorUrl ? String(b.tripAdvisorUrl) : undefined,
  };
}

function mapStandfirstBlock(block: unknown, index: number): IStandfirstSectionProps {
  const b = block as Record<string, unknown>;
  return {
    id: makeId(index),
    documentId: String(b._key || ""),
    __component: "layout.standfirst-section",
    heading: String(b.heading || ""),
    kicker: b.kicker ? String(b.kicker) : undefined,
    standfirst: String(b.standfirst || ""),
    media: mapMedia(b.media, 1600, 900),
    link: mapLink(b.link),
    mediaPosition: String(b.mediaPosition || "left") as IStandfirstSectionProps["mediaPosition"],
    variant: String(b.variant || "featured") as IStandfirstSectionProps["variant"],
  };
}

function mapBlock(
  block: unknown,
  index: number,
  isHomePage: boolean
): LayoutBlock | null {
  const b = block as Record<string, unknown>;
  if (!b || !b._type) return null;

  switch (b._type) {
    case "heroBlock":
      return mapHeroBlock(block, index, isHomePage);
    case "infoBlock":
      return mapInfoBlock(block, index);
    case "galleryBlock":
      return mapGalleryBlock(block, index);
    case "locationBlock":
      return mapLocationBlock(block, index);
    case "dealsBlock":
      return mapDealsBlock(block, index);
    case "reviewsBlock":
      return mapReviewsBlock(block, index);
    case "standfirstBlock":
      return mapStandfirstBlock(block, index);
    default:
      return null;
  }
}

// =============================================================================
// Page mappers
// =============================================================================

function mapPageResultToLegacyPage(
  result: PageBySlugQueryResult | HomePageQueryResult | AnnouncementPageQueryResult,
  isHomePage: boolean
): {
  documentId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: LayoutBlock[];
} | null {
  if (!result) return null;

  const blocks =
    (result.blocks as unknown[] | null | undefined)
      ?.map((b, i) => mapBlock(b, i, isHomePage))
      .filter((b): b is LayoutBlock => b !== null) || [];

  return {
    documentId: result._id,
    title: result.title || "",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    blocks,
  };
}

export function mapToHomePage(result: HomePageQueryResult): THomePage | null {
  return mapPageResultToLegacyPage(result, true);
}

export function mapToAboutUs(result: PageBySlugQueryResult): TAboutUs | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToContactUs(result: PageBySlugQueryResult): TContactUs | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToFoodAndDrinkMenu(result: PageBySlugQueryResult): TFoodAndDrinkMenu | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToGallery(result: PageBySlugQueryResult): TGallery | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToHoursAndLocation(result: PageBySlugQueryResult): THoursAndLocation | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToSpecial(result: PageBySlugQueryResult): TSpecial | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToGenericPage(result: PageBySlugQueryResult): TGenericPage | null {
  return mapPageResultToLegacyPage(result, false);
}

export function mapToAnnouncementPage(result: AnnouncementPageQueryResult): TAnnouncementPage | null {
  if (!result) return null;

  // Date-window guard: GROQ already filters, but double-check in JS
  const now = new Date();
  if (result.startDate && new Date(result.startDate) > now) return null;
  if (result.endDate && new Date(result.endDate) < now) return null;
  if (result.isActive === false) return null;

  const page = mapPageResultToLegacyPage(result, false);
  if (!page) return null;

  return {
    ...page,
    isActive: result.isActive || false,
    startDate: result.startDate || undefined,
    endDate: result.endDate || undefined,
    showOnHomepage: result.showOnHomepage || false,
  };
}
