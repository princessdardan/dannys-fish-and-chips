import React from "react";
import { HeroSection } from "@/components/custom/layout/hero-section";
import { InfoSection } from "@/components/custom/layout/info-section";
import { NewspaperInfoSection } from "@/components/custom/layout/newspaper-info-section";
import { NewspaperMenuSection } from "@/components/custom/layout/newspaper-menu-section";
import { GallerySection } from "@/components/custom/layout/gallery-section";
import type {
  IHeroSectionProps,
  IInfoSectionProps,
  IGallerySectionProps,
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
  | "home"; // → InfoSection (if any)

/**
 * Type for block component registry values
 */
type BlockComponentType =
  | typeof HeroSection
  | typeof GallerySection
  | ((
      props: { data: IInfoSectionProps },
      context: PageContext
    ) => JSX.Element | null);

/**
 * Registry mapping block component types to React components
 */
type BlockComponentMap = {
  "layout.hero-section": typeof HeroSection;
  "layout.gallery-section": typeof GallerySection;
  "layout.info-section": (
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
 * Maps Strapi __component strings to React components
 */
const BLOCK_COMPONENTS: BlockComponentMap = {
  "layout.hero-section": HeroSection,
  "layout.gallery-section": GallerySection,
  "layout.info-section": (props, context) => {
    const Component = getInfoSectionComponent(context);
    return <Component {...props} />;
  },
};

/**
 * Options for renderLayoutBlocks function
 */
interface RenderLayoutBlocksOptions {
  blocks: LayoutBlock[];
  pageContext: PageContext;
}

/**
 * Renders an array of layout blocks using the component registry
 *
 * @param blocks - Array of block objects from Strapi
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
      const componentType = block.__component;

      // Check if component type is registered
      if (!(componentType in BLOCK_COMPONENTS)) {
        console.warn(
          `[Layout Block Renderer] Unknown block component type: ${componentType}`
        );
        return null;
      }

      const Component = BLOCK_COMPONENTS[
        componentType as keyof BlockComponentMap
      ] as BlockComponentType;

      // Generate stable key using component type and ID
      const key = `${block.__component}-${block.id}`;

      // Special handling for info-section to pass context
      if (componentType === "layout.info-section") {
        return (
          <React.Fragment key={key}>
            {(Component as (props: { data: IInfoSectionProps }, context: PageContext) => JSX.Element | null)(
              { data: block as IInfoSectionProps },
              pageContext
            )}
          </React.Fragment>
        );
      }

      // Handle hero-section
      if (componentType === "layout.hero-section") {
        const HeroComponent = Component as typeof HeroSection;
        return <HeroComponent key={key} data={block as IHeroSectionProps} />;
      }

      // Handle gallery-section
      if (componentType === "layout.gallery-section") {
        const GalleryComponent = Component as typeof GallerySection;
        return (
          <GalleryComponent key={key} data={block as IGallerySectionProps} />
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
