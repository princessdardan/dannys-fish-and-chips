import { getStrapiURL } from "@/lib/utils";

interface IStrapiVideoProps {
  src: string;
  caption?: string | null;
  alt?: string | null;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  width?: number;
  height?: number;
}

/**
 * Normalize a Strapi video URL to an absolute URL.
 */
export function getStrapiVideo(url: string | null) {
  const strapiURL = getStrapiURL();
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${strapiURL}${url}`;
}

/**
 * HTML video wrapper that resolves Strapi media URLs.
 *
 * Data flow: converts the `src` (and optional poster) to absolute URLs.
 */
export function StrapiVideo({
  src,
  className,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  poster,
  preload = "metadata",
  width,
  height,
}: Readonly<IStrapiVideoProps>) {
  const videoUrl = getStrapiVideo(src);
  if (!videoUrl) return null;

  const posterUrl = poster ? getStrapiVideo(poster) : undefined;

  return (
    <video
      src={videoUrl}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      poster={posterUrl || undefined}
      preload={preload}
      width={width}
      height={height}
    >
      Your browser does not support the video tag.
    </video>
  );
}
