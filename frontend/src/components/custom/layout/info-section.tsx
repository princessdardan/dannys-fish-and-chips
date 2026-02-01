import { BlockRenderer } from "@/components/ui/block-renderer";
import { StrapiImage } from "@/components/ui/strapi-image";
import { StrapiVideo } from "@/components/ui/strapi-video";
import { BlocksContent, TMedia } from "@/types";

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
}
/**
 * Feature row combining rich text and media with orientation controls.
 *
 * Data flow: renders Strapi BlocksContent alongside image/video media.
 */
export function InfoWithMedia({ data }: { data: IInfoWithMedia }) {
    if (!data) return null;
    const { heading, media, info, orientation } = data;

    // Defensive guard: ensure media exists before accessing properties
    const isVideo = media?.mime?.startsWith("video/") ?? false;
    const isImage = media && !isVideo;
    const mediaAlt = media?.alternativeText || heading || "Info section media";
    
    {/* Text content component */}
    const TextContent = () => (
        <div className="w-full">
            <h2 className="text-2xl justify-center text-center text-brand-red mb-4 font-heading">{heading}</h2>
            <div className="prose prose-lg text-black">
                <BlockRenderer content={info} />
            </div>
        </div>
    );
        
    {/* Image content component */}
    const MediaContent = () => (
        <div className="w-full relative aspect-video rounded-lg overflow-hidden">
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
        </div>
    );
    
    // Determine layout based on orientation
    const renderLayout = () => {
        switch (orientation) {
            case 'MEDIA_LEFT':
                {/* Image on left, text on right */}
                return (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <MediaContent />
                        <TextContent />
                    </div>
                );
            case 'MEDIA_RIGHT':
                {/* Text on left, image on right (default) */}
                return (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <TextContent />
                        <MediaContent />
                    </div>
                );
            case 'MEDIA_TOP':
                {/* Image on top, text below */}
                return (
                    <div className="flex flex-col items-center gap-6">
                        <MediaContent />
                        <TextContent />
                    </div>
                );
            default:
                {/* Default to MEDIA_LEFT */}
                return (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <MediaContent />
                        <TextContent />
                    </div>
                );
        }
    };
    
    return (
        <section className="px-8 pb-6 mx-auto md:px-6 lg:py-2 bg-background">
            <div className="mx-auto">
                <div className="rounded-lg border bg-white text-black border-brand-red my-4 py-6 px-10 shadow-sm transition-shadow hover:shadow-md">
                    {renderLayout()}
                </div>
            </div>
        </section>
    )
}
/**
 * Section wrapper for multiple `InfoWithMedia` features.
 *
 * Layout: centered header text + stacked feature rows.
 */
export function InfoSection({ data }: { data: IInfoSectionProps }) {
    if (!data) return null;
    
    const { heading, subHeading, description, features } = data;

    return (
        <section className="bg-background py-16">
            <div className="container mx-auto justify-center px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    {heading && (
                        <h2 className="text-4xl md:text-5xl font-bold text-heading-text mb-4">
                            {heading}
                        </h2>
                    )}
                    {subHeading && (
                        <p className="text-brand-red font-serif text-lg mb-2 italic">
                            {subHeading}
                        </p>
                    )}
                    {description && (
                        <p className="text-secondary-text max-w-3xl mx-auto text-lg">
                            {description}
                        </p>
                    )}
                </div>

                {/* Features */}
                <div className="space-y-8">
                    {features?.map((feature) => (
                        <InfoWithMedia key={feature.id} data={feature} />
                    ))}
                </div>
            </div>
        </section>
    )
}