import React from "react";
import { stegaClean } from "@sanity/client/stega";
import { HeroSection } from "@/components/custom/layout/hero-section";
import { InfoSection } from "@/components/custom/layout/info-section";
import { NewspaperInfoSection } from "@/components/custom/layout/newspaper-info-section";
import { NewspaperMenuSection } from "@/components/custom/layout/newspaper-menu-section";
import { GallerySection } from "@/components/custom/layout/gallery-section";
import { LocationSection, type ILocationSectionProps } from "@/components/custom/layout/location-section";
import { DealsSection } from "@/components/custom/layout/deals-section";
import { ReviewsSection } from "@/components/custom/layout/reviews-section";
import { StandfirstSection } from "@/components/custom/layout/standfirst-section";
import type {
  IHeroSectionProps,
  IInfoSectionProps,
  IGallerySectionProps,
  IDealsSectionProps,
  IReviewsSectionProps,
  IStandfirstSectionProps,
  LayoutBlock,
} from "@/types";

/**
 * Page context used to determine which InfoSection variant to render
 */
export type PageContext =
  | "about-us" // → NewspaperInfoSection
  | "menu" // → NewspaperMenuSection
  | "contact-us" // → InfoSection
  | "hours-and-location" // → InfoSection
  | "special" // → InfoSection
  | "gallery" // → (no info sections)
  | "home" // → InfoSection (if any)
  | "announcement"; // → InfoSection

/**
 * Extended block type that supports both legacy (__component)
 * and Sanity (_type/_key) shapes during transition.
 *
 * Preserves _id, _type, _key metadata for visual editing and debugging.
 */
type LayoutBlockInput = LayoutBlock & {
  _type?: string;
  _key?: string;
  _id?: string;
};

/**
 * Type for block component registry values
 */
type BlockComponentType =
  | typeof HeroSection
  | typeof GallerySection
  | typeof LocationSection
  | typeof DealsSection
  | typeof ReviewsSection
  | typeof StandfirstSection
  | ((
      props: { data: IInfoSectionProps },
      context: PageContext
    ) => JSX.Element | null);

/**
 * Registry mapping block component types to React components.
 * Supports both legacy __component names and Sanity _type names.
 */
type BlockComponentMap = {
  // Legacy types
  "layout.hero-section": typeof HeroSection;
  "layout.gallery-section": typeof GallerySection;
  "layout.location-section": typeof LocationSection;
  "layout.deals-section": typeof DealsSection;
  "layout.reviews-section": typeof ReviewsSection;
  "layout.standfirst-section": typeof StandfirstSection;
  "layout.info-section": (
    props: { data: IInfoSectionProps },
    context: PageContext
  ) => JSX.Element | null;
  // Sanity types
  heroBlock: typeof HeroSection;
  galleryBlock: typeof GallerySection;
  locationBlock: typeof LocationSection;
  dealsBlock: typeof DealsSection;
  reviewsBlock: typeof ReviewsSection;
  standfirstBlock: typeof StandfirstSection;
  infoBlock: (
    props: { data: IInfoSectionProps },
    context: PageContext
  ) => JSX.Element | null;
};

/**
 * Returns the appropriate InfoSection variant based on page context
 */
function getInfoSectionComponent(context: PageContext) {
  switch (context) {
    case "about-us":
      return NewspaperInfoSection;
    case "menu":
      return NewspaperMenuSection;
    case "contact-us":
    case "hours-and-location":
    case "special":
    case "home":
    case "gallery":
    default:
      return InfoSection;
  }
}

/**
 * Block component registry
 * Maps both legacy __component strings and Sanity _type strings
 * to React components.
 */
const BLOCK_COMPONENTS: BlockComponentMap = {
  // Legacy types
  "layout.hero-section": HeroSection,
  "layout.gallery-section": GallerySection,
  "layout.location-section": LocationSection,
  "layout.deals-section": DealsSection,
  "layout.reviews-section": ReviewsSection,
  "layout.standfirst-section": StandfirstSection,
  "layout.info-section": (props, context) => {
    const Component = getInfoSectionComponent(context);
    return <Component {...props} />;
  },
  // Sanity types
  heroBlock: HeroSection,
  galleryBlock: GallerySection,
  locationBlock: LocationSection,
  dealsBlock: DealsSection,
  reviewsBlock: ReviewsSection,
  standfirstBlock: StandfirstSection,
  infoBlock: (props, context) => {
    const Component = getInfoSectionComponent(context);
    return <Component {...props} />;
  },
};

/**
 * Options for renderLayoutBlocks function
 */
interface RenderLayoutBlocksOptions {
  blocks: LayoutBlockInput[];
  pageContext: PageContext;
}

/**
 * Renders an array of layout blocks using the component registry.
 *
 * Supports both legacy blocks (__component) and Sanity blocks (_type).
 * Uses stegaClean for type comparisons to handle visual editing metadata.
 * Preserves _id, _type, _key on blocks for visual editing compatibility.
 *
 * @param blocks - Array of block objects from Sanity or legacy data
 * @param pageContext - Current page context for variant selection
 * @returns Array of React elements or null
 *
 * @example
 * ```tsx
 * renderLayoutBlocks({
 *   blocks: data.blocks,
 *   pageContext: 'about-us'
 * })
 * ```
 */
export function renderLayoutBlocks({
  blocks,
  pageContext,
}: RenderLayoutBlocksOptions) {
  // Handle empty or invalid blocks array
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return blocks.map((block, index) => {
    try {
      // Prefer Sanity _type, fall back to legacy __component
      const rawType = block._type ?? block.__component;

      // Use stegaClean only for type comparison (not rendered text)
      const componentType =
        typeof rawType === "string" ? stegaClean(rawType) : undefined;

      // Check if component type is registered
      if (!componentType || !(componentType in BLOCK_COMPONENTS)) {
        console.warn(
          `[Layout Block Renderer] Unknown block component type: ${componentType}`
        );
        return null;
      }

      const Component = BLOCK_COMPONENTS[
        componentType as keyof BlockComponentMap
      ] as BlockComponentType;

      // Use _key when available (Sanity), otherwise stable fallback
      const key = block._key ?? `${componentType}-${block.id ?? index}`;

      // Special handling for info-section to pass context
      if (
        componentType === "layout.info-section" ||
        componentType === "infoBlock"
      ) {
        return (
          <React.Fragment key={key}>
            {(
              Component as (
                props: { data: IInfoSectionProps },
                context: PageContext
              ) => JSX.Element | null
            )(
              { data: block as IInfoSectionProps },
              pageContext
            )}
          </React.Fragment>
        );
      }

      // Handle hero-section
      if (
        componentType === "layout.hero-section" ||
        componentType === "heroBlock"
      ) {
        const HeroComponent = Component as typeof HeroSection;
        return <HeroComponent key={key} data={block as IHeroSectionProps} />;
      }

      // Handle gallery-section
      if (
        componentType === "layout.gallery-section" ||
        componentType === "galleryBlock"
      ) {
        const GalleryComponent = Component as typeof GallerySection;
        return (
          <GalleryComponent key={key} data={block as IGallerySectionProps} />
        );
      }

      // Handle location-section
      if (
        componentType === "layout.location-section" ||
        componentType === "locationBlock"
      ) {
        const LocationComponent = Component as typeof LocationSection;
        return (
          <LocationComponent key={key} data={block as ILocationSectionProps} />
        );
      }

      // Handle deals-section
      if (
        componentType === "layout.deals-section" ||
        componentType === "dealsBlock"
      ) {
        const DealsComponent = Component as typeof DealsSection;
        return (
          <DealsComponent key={key} data={block as IDealsSectionProps} />
        );
      }

      // Handle reviews-section
      if (
        componentType === "layout.reviews-section" ||
        componentType === "reviewsBlock"
      ) {
        const ReviewsComponent = Component as typeof ReviewsSection;
        return (
          <ReviewsComponent key={key} data={block as IReviewsSectionProps} />
        );
      }

      // Handle standfirst-section
      if (
        componentType === "layout.standfirst-section" ||
        componentType === "standfirstBlock"
      ) {
        const StandfirstComponent = Component as typeof StandfirstSection;
        return (
          <StandfirstComponent key={key} data={block as IStandfirstSectionProps} />
        );
      }

      return null;
    } catch (error) {
      console.error(
        `[Layout Block Renderer] Error rendering block at index ${index}:`,
        error
      );
      return null;
    }
  });
}
