import Image from "next/image";

interface ICmsMediaProps {
  src: string;
  alt: string | null;
  caption?: string | null;
  height?: number;
  width?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  draggable?: boolean;
}

/**
 * Normalize a media URL. Data, http/https, protocol-relative and relative URLs
 * are returned as-is.
 */
export function getMediaUrl(url: string | null) {
  if (!url) return null;
  return url;
}

/**
 * Next.js Image wrapper that resolves CMS media URLs.
 *
 * Data flow: converts the `src` to a usable URL before rendering.
 */
export function CmsImage({
  src,
  alt,
  className,
  ...rest
}: Readonly<ICmsMediaProps>) {
  const imageUrl = getMediaUrl(src);
  if (!imageUrl) return null;

  const resolvedAlt = alt ?? "";

  if (process.env.NODE_ENV === "development" && !alt) {
    console.warn(`[CmsImage] Missing alt text for image: ${src}`);
  }

  return (
    <Image
      src={imageUrl}
      alt={resolvedAlt}
      className={className}
      {...(resolvedAlt === "" && { "aria-hidden": true })}
      {...rest}
    />
  );
}
