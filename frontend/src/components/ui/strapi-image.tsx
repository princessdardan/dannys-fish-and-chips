import Image from "next/image";

import { getStrapiURL } from "@/lib/utils";

interface IStrapiMediaProps {
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
 * Normalize a Strapi media URL to an absolute URL.
 */
export function getStrapiMedia(url: string | null) {
  const strapiURL = getStrapiURL();
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${strapiURL}${url}`;
}

/**
 * Next.js Image wrapper that resolves Strapi media URLs.
 *
 * Data flow: converts the `src` to an absolute URL before rendering.
 */
export function StrapiImage({
  src,
  alt,
  className,
  ...rest
}: Readonly<IStrapiMediaProps>) {
  const imageUrl = getStrapiMedia(src);
  if (!imageUrl) return null;

  const resolvedAlt = alt ?? "";

  if (process.env.NODE_ENV === "development" && !alt) {
    console.warn(`[StrapiImage] Missing alt text for image: ${src}`);
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