interface ICmsVideoProps {
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
 * Normalize a video URL. Absolute URLs (e.g. CDN) are returned as-is.
 */
export function getVideoUrl(url: string | null) {
  if (!url) return null;
  return url;
}

/**
 * HTML video wrapper that resolves CMS media URLs.
 *
 * Data flow: converts the `src` (and optional poster) to usable URLs.
 */
export function CmsVideo({
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
}: Readonly<ICmsVideoProps>) {
  const videoUrl = getVideoUrl(src);
  if (!videoUrl) return null;

  const posterUrl = poster ? getVideoUrl(poster) : undefined;

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
