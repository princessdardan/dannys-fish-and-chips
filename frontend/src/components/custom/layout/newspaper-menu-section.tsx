import { BlockRenderer } from "@/components/ui/block-renderer";
import { StrapiImage } from "@/components/ui/strapi-image";
import { StrapiVideo } from "@/components/ui/strapi-video";
import { IInfoSectionProps, IInfoWithMedia } from "./info-section";
import { MenuColumnsWrapper } from "./menu-columns-wrapper";

function MenuColumn({ feature }: { feature: IInfoWithMedia }) {
  const { heading, media, info } = feature;
  const isVideo = media?.mime?.startsWith("video/");
  const isImage = media && !isVideo;
  const mediaAlt = media?.alternativeText || heading || "Menu category image";

  return (
    <div className="mb-8 pt-4">
      {/* Media - Newspaper photo style */}
      {media && (
        <figure className="mb-4">
          <div className="relative aspect-4/3 border-2 border-brand-black/30 overflow-hidden bg-gray-100">
            {isVideo && (
              <StrapiVideo
                src={media.url}
                className="absolute inset-0 object-cover w-full h-full grayscale-30"
                autoPlay={true}
                loop={true}
                muted={true}
                controls={false}
              />
            )}
            {isImage && (
              <StrapiImage
                alt={mediaAlt}
                className="absolute inset-0 object-cover w-full h-full grayscale-30 contrast-110"
                src={media.url}
                height={600}
                width={800}
              />
            )}
          </div>
          {media.caption && (
            <figcaption className="text-xs italic text-brand-black/70 mt-2 px-1 font-serif text-center border-t border-brand-black/20 pt-1.5">
              {media.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Category Header - Newspaper section style */}
      <div className="mb-4 pb-2">
        <h3 className="font-serif text-2xl text-center font-bold text-brand-black uppercase tracking-wide">
          {heading}
        </h3>
        <div className="h-0.5 bg-brand-black w-48 mx-auto mt-1" />
      </div>

      {/* Menu Items - rendered from BlocksContent */}
      <div className="newspaper-body text-brand-black/90 leading-relaxed text-sm">
        <BlockRenderer content={info} />
      </div>
    </div>
  );
}

/**
 * Newspaper-styled menu section with multi-column layout.
 *
 * Layout: masthead + columns of menu categories via `MenuColumnsWrapper`.
 */
export function NewspaperMenuSection({ data }: { data: IInfoSectionProps }) {
  if (!data) return null;

  const { heading, subHeading, description, features } = data;

  return (
    <section className="bg-[#f4e8d0] py-12 relative overflow-hidden">
      {/* Vintage paper texture overlay */}
      <div className="paper-texture absolute inset-0 opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Newspaper Masthead */}
        <header className="text-center mb-12 border-b-4 border-double border-brand-black pb-8">
          {/* Decorative top border */}
          <div className="border-t-2 border-b border-brand-black mb-6 py-1">
            <div className="flex justify-between items-center text-xs font-serif text-brand-black/60 px-4">
              <span>Established 1975</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <span>•</span>
              <span>Freshly Prepared Daily</span>
            </div>
          </div>

          {heading && (
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black text-brand-black mb-3 tracking-tight leading-none">
              {heading}
            </h1>
          )}

          {subHeading && (
            <p className="font-serif text-xl md:text-2xl italic text-brand-red mt-4 mb-3">
              {subHeading}
            </p>
          )}

          {description && (
            <p className="text-brand-black/80 max-w-3xl mx-auto text-base font-serif leading-relaxed border-t border-brand-black/30 pt-4 mt-4">
              {description}
            </p>
          )}
        </header>

        {/* Menu Content - Newspaper page style with responsive columns */}
        <div className="bg-[#faf5e9] border-4 border-brand-black shadow-2xl p-6 md:p-10 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-brand-red" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-brand-red" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-brand-red" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-brand-red" />

          {/* Responsive Multi-Column Layout */}
          <MenuColumnsWrapper>
            {features?.map((feature) => (
              <MenuColumn key={feature.id} feature={feature} />
            ))}
          </MenuColumnsWrapper>

          {/* Bottom banner */}
          <div className="border-t-2 border-brand-black mt-10 pt-5 text-center">
            <p className="font-serif text-sm italic text-brand-black/60">
              {"Serving the finest fish & chips since 1975 - Danny's Fish & Chips"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
