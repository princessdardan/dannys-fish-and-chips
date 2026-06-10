import Image, { ImageProps } from "next/image";

import { urlForImage } from "@/sanity/lib/image";

/**
 * Sanity image asset shape with nullable fields as returned by GROQ queries.
 */
interface SanityImageAsset {
  _id?: string | null;
  _ref?: string | null;
  _type?: string | null;
  url?: string | null;
  metadata?: {
    dimensions?: {
      width?: number | null;
      height?: number | null;
      aspectRatio?: number | null;
    } | null;
  } | null;
}

interface SanityImageMetadata {
  dimensions?: {
    width?: number | null;
    height?: number | null;
    aspectRatio?: number | null;
  } | null;
}

interface SanityImageCrop {
  top?: number | null;
  bottom?: number | null;
  left?: number | null;
  right?: number | null;
}

interface SanityImageHotspot {
  x?: number | null;
  y?: number | null;
  height?: number | null;
  width?: number | null;
}

interface SanityImageSource {
  asset?: SanityImageAsset | null;
  alt?: string | null;
  caption?: string | null;
  metadata?: SanityImageMetadata | null;
  crop?: SanityImageCrop | null;
  hotspot?: SanityImageHotspot | null;
}

interface SanityImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: SanityImageSource | null | undefined;
  alt?: string | null;
  caption?: string | null;
}

/**
 * Resolve a usable image URL from a Sanity image source.
 *
 * Data flow: when the asset has an _id or _ref, passes the full image record
 * (including crop/hotspot) to urlForImage so Sanity can apply them. When
 * target dimensions are provided, chains .width()/.height() so hotspot-derived
 * rect params are computed. Falls back to asset.url for direct URLs; returns
 * null otherwise.
 */
function resolveImageUrl(
  src: SanityImageSource | null | undefined,
  targetWidth?: number,
  targetHeight?: number
): string | null {
  if (!src) return null;

  const asset = src.asset;
  if (!asset) return null;

  if (asset._id || asset._ref) {
    let builder = urlForImage(src);
    if (targetWidth) builder = builder.width(targetWidth);
    if (targetHeight) builder = builder.height(targetHeight);
    return builder.url();
  }

  if (asset.url) {
    return asset.url;
  }

  return null;
}

const toNumber = (v: number | `${number}` | undefined): number | undefined =>
  typeof v === "string" ? Number(v) : v;

const orUndefined = (v: number | null | undefined): number | undefined =>
  v == null ? undefined : v;

/**
 * Resolve dimensions from either the asset metadata (Sanity query shape) or
 * the top-level metadata field, preferring props when provided.
 *
 * Next Image allows width/height as number or numeric string; we normalize
 * to number for fallback logic.
 */
function resolveDimensions(
  src: SanityImageSource | null | undefined,
  width?: number | `${number}`,
  height?: number | `${number}`
): { width: number | undefined; height: number | undefined } {
  const assetDimensions = src?.asset?.metadata?.dimensions;
  const topLevelDimensions = src?.metadata?.dimensions;

  return {
    width:
      toNumber(width) ??
      orUndefined(assetDimensions?.width) ??
      orUndefined(topLevelDimensions?.width),
    height:
      toNumber(height) ??
      orUndefined(assetDimensions?.height) ??
      orUndefined(topLevelDimensions?.height),
  };
}

/**
 * Next.js Image wrapper for Sanity images.
 *
 * Data flow: resolves URL via urlForImage or asset.url, computes width/height
 * from props or metadata (asset.metadata.dimensions or src.metadata.dimensions),
 * and renders a Next Image component. When a caption is present, wraps the
 * image in a <figure> with <figcaption>.
 *
 * Additional safe Next Image props are forwarded via rest.
 *
 * Returns null when no resolvable image source is provided.
 */
export function SanityImage({
  src,
  alt,
  caption,
  width,
  height,
  className,
  fill,
  priority,
  sizes,
  ...rest
}: Readonly<SanityImageProps>) {
  const resolvedAlt = alt ?? src?.alt ?? "";
  const resolvedCaption = caption ?? src?.caption;
  const { width: resolvedWidth, height: resolvedHeight } = resolveDimensions(
    src,
    width,
    height
  );

  // URL generation target dimensions: explicit props > fill fallback > metadata > non-fill fallback
  const explicitW = toNumber(width);
  const explicitH = toNumber(height);
  const hasExplicitTarget = explicitW != null && explicitH != null;
  const urlWidth = hasExplicitTarget
    ? explicitW
    : fill
      ? 1600
      : (resolvedWidth ?? 800);
  const urlHeight = hasExplicitTarget
    ? explicitH
    : fill
      ? 900
      : (resolvedHeight ?? 600);
  const imageUrl = resolveImageUrl(src, urlWidth, urlHeight);
  if (!imageUrl) return null;

  if (process.env.NODE_ENV === "development" && !resolvedAlt) {
    console.warn("[SanityImage] Missing alt text for image:", imageUrl);
  }

  const ariaHidden = resolvedAlt === "" ? true : undefined;

  const imageElement = fill ? (
    <Image
      src={imageUrl}
      alt={resolvedAlt}
      fill
      className={className}
      priority={priority}
      sizes={sizes}
      aria-hidden={ariaHidden}
      {...rest}
    />
  ) : (
    <Image
      src={imageUrl}
      alt={resolvedAlt}
      width={resolvedWidth ?? 800}
      height={resolvedHeight ?? 600}
      className={className}
      priority={priority}
      sizes={sizes}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );

  if (resolvedCaption) {
    return (
      <figure>
        {imageElement}
        <figcaption>{resolvedCaption}</figcaption>
      </figure>
    );
  }

  return imageElement;
}
