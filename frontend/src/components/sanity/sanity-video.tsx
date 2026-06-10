interface SanityVideoAsset {
  asset?: {
    _id?: string | null;
    url?: string | null;
  } | null;
}

type SanityVideoSrc = string | SanityVideoAsset | null | undefined;

interface SanityVideoProps {
  src: SanityVideoSrc;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number;
  height?: number;
}

/**
 * Resolve a video URL from either a plain string or a Sanity file object shape.
 *
 * Data flow: plain strings pass through; objects read src.asset.url.
 */
function resolveVideoUrl(src: SanityVideoSrc): string | null {
  if (!src) return null;
  if (typeof src === "string") return src;
  return src.asset?.url ?? null;
}

/**
 * Simple HTML5 video wrapper for Sanity-hosted (or any external) video assets.
 *
 * Data flow: resolves URL from plain string or Sanity object shape,
 * renders a <video> element when a URL is present; returns null otherwise.
 */
export function SanityVideo({
  src,
  className,
  autoPlay,
  loop,
  muted,
  controls = true,
  width,
  height,
}: Readonly<SanityVideoProps>) {
  const videoUrl = resolveVideoUrl(src);
  if (!videoUrl) return null;

  return (
    <video
      src={videoUrl}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      width={width}
      height={height}
    />
  );
}
