import { TMedia, TLink } from "@/types";
import Link from "next/link";
import { StrapiImage } from "@/components/ui/strapi-image";
import { StrapiVideo } from "@/components/ui/strapi-video";
import { Button } from "@/components/ui/button";


export interface IHeroSectionProps {
  id: number;
  documentId: string;
  __component: "layout.hero-section";
  heading: string;
  subHeading: string;
  description: string;
  media?: TMedia;
  link: TLink[];
  onHomepage: boolean;
}

/**
 * Hero section with optional image/video background and CTA links.
 *
 * Data flow: receives Strapi media + link data and renders a layout variant
 * based on the `onHomepage` flag.
 */
export function HeroSection({ data }: { data: IHeroSectionProps }) {
    if (!data) return null;

    const { heading, subHeading, description, media, link, onHomepage } = data;

  // Determine media type based on mime type
  const isVideo = media?.mime?.startsWith("video/");
  const isImage = media && !isVideo;
  const mediaAlt = (media?.alternativeText || heading || "Hero banner");

  // Page variant for internal pages
  if (!onHomepage) {
    return (
      <section className="relative h-[60vh] md:h-[70vh]">
        {isVideo && media && (
          <StrapiVideo
            src={media.url}
            className="absolute inset-0 object-cover w-full h-full"
            autoPlay={true}
            loop={true}
            muted={true}
            controls={false}
          />
        )}
        {isImage && media && (
          <StrapiImage
            alt={mediaAlt}
            className="absolute inset-0 object-cover w-full h-full"
            src={media.url}
            height={2160}
            width={3840}
          />
        )}
        <div className="relative px-8 py-4 z-10 flex flex-col items-center justify-center h-full bg-black/60 text-center">
          <h1 className="hero-heading">
            {heading}
          </h1>
          {subHeading && (
            <p className="hero-subheading">
              {subHeading}
            </p>
          )}
          {description && (
            <p className="hero-description">{description}</p>
          )}
          {link && link.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              {link.map((btn) => {
                // Defensive guards for button properties
                if (!btn?.href || !btn?.label) return null;

                return (
                  <Link key={btn.id} href={btn.href}>
                      <Button className="inline-flex border-4 border-brand-black italic items-center text-brand-black font-serif text-xl justify-center px-10 py-8 font-bold bg-[#faf5e9] hover:bg-[#f4e8d0] shadow-2xl transition-all hover:shadow-xl relative" variant="secondary">
                          <span className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-brand-red" />
                          <span className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-brand-red" />
                          <span className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-brand-red" />
                          <span className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-brand-red" />
                          {btn.label}
                      </Button>
                  </Link>
                );
              })}
            </div>)}
        </div>
      </section>
    );
  }

  // Homepage variant (default)
  return (
    <section className="relative h-screen overflow-hidden">
      {isVideo && media && (
        <StrapiVideo
          src={media.url}
          className="absolute inset-0 object-cover w-full h-full"
          autoPlay={true}
          loop={true}
          muted={true}
          controls={false}
        />
      )}
      {isImage && media && (
        <StrapiImage
          alt={mediaAlt}
          className="absolute inset-0 object-cover w-full h-full aspect/16:9"
          src={media.url}
          height={2160}
          width={3840}
        />
      )}
      <div className="relative px-8 py-4 z-10 flex flex-col items-center justify-center h-full bg-black/50 text-center">
        <h1 className="hero-heading-home">
          {heading}
        </h1>
        {subHeading && (
          <p className="hero-subheading">
            {subHeading}
          </p>
        )}
        {description && (
          <p className="hero-description">
            {description}
          </p>
        )}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
            {link && link.length > 0 && link.map((btn) => {
              // Defensive guards for button properties
              if (!btn?.href || !btn?.label) return null;

              return (
                <Link key={btn.id} href={btn.href}>
                    <Button className="inline-flex border-4 border-brand-black italic items-center text-brand-black font-serif text-xl justify-center px-10 py-8 font-bold bg-[#faf5e9] hover:bg-[#f4e8d0] shadow-2xl transition-all hover:shadow-xl relative" variant="secondary">
                        <span className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-brand-red" />
                        <span className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-brand-red" />
                        <span className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-brand-red" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-brand-red" />
                        {btn.label}
                    </Button>
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  )
}