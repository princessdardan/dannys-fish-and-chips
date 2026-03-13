"use client";

import { IGallerySectionProps } from "@/types";
import { MagazineGallery } from "./magazine-gallery";

/**
 * Magazine-style gallery section.
 *
 * Data flow: consumes Strapi image list and renders a vintage broadsheet-style
 * magazine with page-turning navigation.
 */
export function GallerySection({ data }: { data: IGallerySectionProps }) {
  if (!data) return null;

  const { heading, subHeading, description, images } = data;

  if (!images || !Array.isArray(images) || images.length === 0) return null;

  return (
    <section className="px-2 py-8 mx-auto md:px-6 lg:pt-12 lg:pb-16 bg-brand-cream  overflow-hidden">
      <div className="container mx-auto max-w-2xl">
        <div className="text-container max-w-4xl mx-auto">
          <h2 className="section-heading-red">{heading}</h2>
          <p className="font-light text-black text-xl md:text-2xl lg:text-3xl">
            {subHeading}
          </p>
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-brand-black">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="container mx-auto mt-8">
        <MagazineGallery images={images} />
      </div>
    </section>
  );
}
