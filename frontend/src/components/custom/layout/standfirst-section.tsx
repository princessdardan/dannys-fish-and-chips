import Link from "next/link";
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
import { cn } from "@/lib/utils";
import type { IStandfirstSectionProps } from "@/types";

/**
 * Newspaper-styled standfirst/deck component.
 *
 * In journalism, a "standfirst" (also called "deck") is the introductory
 * text between a headline and body that summarizes content and draws readers in.
 *
 * Two variants:
 * - featured: Full newspaper treatment with card, corner decorations, prominent CTA
 * - compact: Simpler inline layout with rule dividers
 */
export function StandfirstSection({ data }: { data: IStandfirstSectionProps }) {
  if (!data) return null;

  const { heading, kicker, standfirst, media, link, mediaPosition, variant } = data;

  const isVideo = media?.mime?.startsWith("video/");
  const isImage = media && !isVideo;
  const mediaAlt = media?.alternativeText || heading || "Featured image";

  if (variant === "compact") {
    return <CompactStandfirst data={data} />;
  }

  return (
    <section className="bg-brand-cream py-12 md:py-16 relative overflow-hidden">
      {/* Vintage paper texture overlay */}
      <div className="paper-texture absolute inset-0 opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative">
        {/* Masthead rule */}
        <div className="border-t-2 border-b border-brand-black/30 mb-8 py-1">
          <div className="flex justify-center items-center text-xs font-serif text-brand-black/60 tracking-widest uppercase">
            <span>Featured Story</span>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-brand-light-cream border-4 border-brand-black shadow-2xl p-6 md:p-10 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-brand-red" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-brand-red" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-brand-red" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-brand-red" />

          {/* Content grid */}
          <div
            className={cn(
              "grid gap-8 items-center",
              media ? "md:grid-cols-2" : "md:grid-cols-1",
              mediaPosition === "right" && media && "md:[&>*:first-child]:order-2"
            )}
          >
            {/* Media */}
            {media && (
              <figure className="relative">
                <div className="relative aspect-4/3 border-2 border-brand-black/30 overflow-hidden bg-gray-100">
                  {isVideo && (
                    <CmsVideo
                      src={media.url}
                      className="absolute inset-0 object-cover w-full h-full"
                      autoPlay={true}
                      loop={true}
                      muted={true}
                      controls={false}
                    />
                  )}
                  {isImage && (
                    <CmsImage
                      alt={mediaAlt}
                      className="absolute inset-0 object-cover w-full h-full grayscale-[0.3] contrast-[1.1]"
                      src={media.url}
                      height={600}
                      width={800}
                    />
                  )}
                </div>
                <figcaption className="text-xs italic text-brand-black/70 mt-3 px-1 font-serif text-center border-t border-brand-black/20 pt-2">
                  {media.caption || mediaAlt}
                </figcaption>
              </figure>
            )}

            {/* Text content */}
            <div className="flex flex-col justify-center">
              {/* Kicker/Eyebrow */}
              {kicker && (
                <span className="inline-block text-xs font-serif uppercase tracking-[0.2em] text-brand-red mb-3 relative">
                  {kicker}
                  <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-brand-red" />
                </span>
              )}

              {/* Heading */}
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black leading-tight tracking-tight mb-4">
                {heading}
              </h2>

              {/* Standfirst text */}
              <p className="font-serif text-lg md:text-xl italic text-brand-black/80 leading-relaxed border-l-4 border-brand-red pl-4 mb-6">
                {standfirst}
              </p>

              {/* CTA Button */}
              {link && (
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 self-start",
                    "px-6 py-3 bg-brand-red text-white font-semibold",
                    "border-2 border-brand-red",
                    "transition-all duration-200",
                    "hover:bg-transparent hover:text-brand-red",
                    "focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
                  )}
                  {...(link.isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {link.label}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Bottom banner */}
          <div className="border-t-2 border-brand-black mt-10 pt-5 text-center">
            <p className="font-serif text-sm italic text-brand-black/60">
              {"All the news that's fit to fry - Danny's Fish & Chips Chronicle"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Compact variant with simpler inline layout.
 */
function CompactStandfirst({ data }: { data: IStandfirstSectionProps }) {
  const { heading, kicker, standfirst, media, link, mediaPosition } = data;

  const isVideo = media?.mime?.startsWith("video/");
  const isImage = media && !isVideo;
  const mediaAlt = media?.alternativeText || heading || "Featured image";

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Top rule */}
        <div className="border-t-2 border-brand-black mb-8" />

        {/* Content grid */}
        <div
          className={cn(
            "grid gap-8 items-center",
            media ? "md:grid-cols-[1fr_2fr]" : "md:grid-cols-1",
            mediaPosition === "right" && media && "md:grid-cols-[2fr_1fr] md:[&>*:first-child]:order-2"
          )}
        >
          {/* Media */}
          {media && (
            <div className="relative aspect-square overflow-hidden border border-brand-black/20">
              {isVideo && (
                <CmsVideo
                  src={media.url}
                  className="absolute inset-0 object-cover w-full h-full"
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  controls={false}
                />
              )}
              {isImage && (
                <CmsImage
                  alt={mediaAlt}
                  className="absolute inset-0 object-cover w-full h-full"
                  src={media.url}
                  height={400}
                  width={400}
                />
              )}
            </div>
          )}

          {/* Text content */}
          <div>
            {/* Kicker */}
            {kicker && (
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-red mb-2 block">
                {kicker}
              </span>
            )}

            {/* Heading */}
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-black leading-tight mb-3">
              {heading}
            </h2>

            {/* Standfirst */}
            <p className="text-brand-black/70 leading-relaxed mb-4">
              {standfirst}
            </p>

            {/* CTA Link */}
            {link && (
              <Link
                href={link.href}
                className="inline-flex items-center gap-1 text-brand-red font-medium hover:underline"
                {...(link.isExternal && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {link.label}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="border-t border-brand-black/30 mt-8" />
      </div>
    </section>
  );
}
