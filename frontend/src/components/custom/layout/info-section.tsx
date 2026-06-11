import Link from "next/link";
import { BlockRenderer } from "@/components/ui/block-renderer";
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
import { cn } from "@/lib/utils";
import { BlocksContent, TMedia, TLink } from "@/types";

export interface IInfoWithMedia {
  id: number;
  heading: string;
  media: TMedia;
  info: BlocksContent;
  orientation: string;
};

export interface IInfoSectionProps {
    id: number;
    documentId: string;
    __component: "layout.info-section";
    heading: string;
    subHeading?: string;
    description?: string;
    features: IInfoWithMedia[];
    link?: TLink;
}

/**
 * Newspaper-styled feature article with orientation support.
 *
 * Data flow: renders CMS BlocksContent alongside image/video media.
 */
export function InfoWithMedia({ data, index }: { data: IInfoWithMedia; index: number }) {
    if (!data) return null;
    const { heading, media, info, orientation } = data;

    const isVideo = media?.mime?.startsWith("video/") ?? false;
    const isImage = media && !isVideo;
    const mediaAlt = media?.alternativeText || heading || "Info section media";

    const mediaOrderClass =
        orientation === "MEDIA_RIGHT" ? "md:[&>figure]:order-2" :
        "";

    const isTopLayout = orientation === "MEDIA_TOP";

    return (
        <article className="border-b-2 border-brand-black/20 pb-10 mb-10 last:border-b-0 last:pb-8 last:mb-0">
            {/* Article Headline */}
            <div className="border-b border-brand-black mb-6 pb-3">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-brand-black leading-tight tracking-tight">
                    {heading}
                </h3>
                <div className="flex items-center gap-3 mt-3 text-xs text-brand-black/60 font-serif italic">
                    <span>Volume XLII</span>
                    <span>•</span>
                    <span>Special Feature</span>
                </div>
            </div>

            {/* Article Content */}
            <div className={cn(
                media && !isTopLayout && "md:grid md:grid-cols-2 md:gap-8 md:items-start",
                media && isTopLayout && "flex flex-col gap-6",
                !media && "",
                mediaOrderClass
            )}>
                {/* Media Section */}
                {media && (
                    <figure className={cn(
                        "mb-6",
                        !isTopLayout && "md:mb-0 md:h-full md:flex md:flex-col"
                    )}>
                        <div className={cn(
                            "relative border-2 border-brand-black/30 overflow-hidden bg-gray-100",
                            isTopLayout ? "aspect-video" : "aspect-4/3 md:aspect-auto md:flex-1"
                        )}>
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
                                    className="absolute inset-0 object-cover w-full h-full grayscale-30 contrast-110"
                                    src={media.url}
                                    height={900}
                                    width={1200}
                                />
                            )}
                        </div>
                        <figcaption className="text-xs italic text-brand-black/70 mt-3 px-1 font-serif text-center border-t border-brand-black/20 pt-2">
                            {mediaAlt}
                        </figcaption>
                    </figure>
                )}

                {/* Text Content with newspaper typography */}
                <div className={`newspaper-body ${index === 0 ? 'drop-cap' : ''} text-brand-black/90 leading-relaxed`}>
                    <BlockRenderer content={info} />
                </div>
            </div>
        </article>
    );
}

/**
 * Newspaper-styled section wrapper for multiple `InfoWithMedia` features.
 *
 * Layout: masthead header + bordered card with stacked feature articles + optional CTA.
 */
export function InfoSection({ data }: { data: IInfoSectionProps }) {
    if (!data) return null;

    const { heading, subHeading, description, features, link } = data;

    return (
        <section className="bg-brand-cream py-12 relative overflow-hidden">
            {/* Vintage paper texture overlay */}
            <div className="paper-texture absolute inset-0 opacity-[0.03] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-6xl relative">
                {/* Newspaper Masthead */}
                <header className="text-center mb-12 border-b-4 border-double border-brand-black pb-8">
                    {/* Decorative top border */}
                    <div className="border-t-2 border-b border-brand-black mb-6 py-1">
                        <div className="flex justify-between items-center text-xs font-serif text-brand-black/60 px-4">
                            <span>Established 1985</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            <span>•</span>
                            <span>Price: Priceless</span>
                        </div>
                    </div>

                    {heading && (
                        <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black text-brand-black mb-3 tracking-tight leading-none">
                            {heading}
                        </h2>
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

                {/* Newspaper Articles Layout */}
                <div className="bg-brand-light-cream border-4 border-brand-black shadow-2xl p-6 md:p-10 relative">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-brand-red" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-brand-red" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-brand-red" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-brand-red" />

                    {/* Articles */}
                    <div>
                        {features?.map((feature, index) => (
                            <InfoWithMedia key={feature.id} data={feature} index={index} />
                        ))}
                    </div>

                    {/* CTA Button */}
                    {link && (
                        <div className="text-center mt-10 pt-6 border-t border-brand-black/20">
                            <Link
                                href={link.href}
                                className={cn(
                                    "inline-flex items-center gap-2",
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
                        </div>
                    )}

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
