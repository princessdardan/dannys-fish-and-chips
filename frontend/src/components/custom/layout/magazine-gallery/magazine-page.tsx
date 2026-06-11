"use client";

import { cn } from "@/lib/utils";
import { TImage } from "@/types";
import { CmsImage } from "@/components/ui/cms-image";
import { MagazineCaption } from "./magazine-caption";

interface MagazinePageProps {
  image: TImage | null;
  figureNumber: number;
  position: "left" | "right";
  isExpanded: boolean;
  onToggleExpand: () => void;
  isFlipping?: boolean;
  flipDirection?: "next" | "prev" | null;
  isBrandedBlank?: boolean;
  className?: string;
}

/**
 * Corner flourish SVG for vintage decoration.
 */
function CornerFlourish({ className }: { className: string }) {
  return (
    <svg
      className={cn("magazine-corner-flourish", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 2 L2 8 M2 2 L8 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-brand-red/50"
      />
      <path
        d="M4 4 L4 6 M4 4 L6 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-brand-black/30"
      />
    </svg>
  );
}

/**
 * Branded blank page for odd image counts.
 */
function BrandedBlankPage() {
  return (
    <div className="magazine-branded-page">
      <p className="magazine-branded-page-title">Danny&apos;s</p>
      <p className="magazine-branded-page-subtitle">Fish & Chips</p>
      <div className="mt-6 w-16 h-px bg-brand-red/30" aria-hidden="true" />
      <p className="font-serif text-xs text-brand-black/30 mt-4 italic">
        Est. since forever
      </p>
    </div>
  );
}

/**
 * Single magazine page with image, caption, and decorations.
 *
 * Features:
 * - Cream paper texture background
 * - Corner flourishes for vintage aesthetic
 * - Click to expand/collapse caption
 * - Hover corner lift effect
 * - Focus bracket indicators for accessibility
 */
export function MagazinePage({
  image,
  figureNumber,
  position,
  isExpanded,
  onToggleExpand,
  isFlipping = false,
  flipDirection,
  isBrandedBlank = false,
  className,
}: MagazinePageProps) {
  const positionClass = position === "left" ? "magazine-page-left" : "magazine-page-right";

  const flipClass = isFlipping
    ? position === "left"
      ? flipDirection === "next"
        ? "magazine-page-flip-left"
        : ""
      : flipDirection === "prev"
        ? "magazine-page-flip-right"
        : ""
    : "";

  const caption = image?.caption || image?.alternativeText || `Gallery image ${figureNumber}`;

  return (
    <div
      className={cn(
        "magazine-page magazine-paper magazine-focus-brackets",
        positionClass,
        flipClass,
        !isBrandedBlank && "magazine-page-hover cursor-pointer",
        "flex flex-col",
        "w-full md:w-1/2",
        "aspect-[3/4]",
        className
      )}
      onClick={!isBrandedBlank ? onToggleExpand : undefined}
      tabIndex={!isBrandedBlank ? 0 : undefined}
      role={!isBrandedBlank ? "button" : undefined}
      aria-label={!isBrandedBlank ? `${isExpanded ? "Collapse" : "Expand"} caption for figure ${figureNumber}` : undefined}
      onKeyDown={
        !isBrandedBlank
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleExpand();
              }
            }
          : undefined
      }
    >
      {/* Corner flourishes */}
      <CornerFlourish className="magazine-corner-flourish-tl" />
      <CornerFlourish className="magazine-corner-flourish-tr" />
      <CornerFlourish className="magazine-corner-flourish-bl" />
      <CornerFlourish className="magazine-corner-flourish-br" />

      {isBrandedBlank ? (
        <BrandedBlankPage />
      ) : image ? (
        <>
          {/* Image container */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div className="relative w-full h-full">
              <CmsImage
                src={image.url}
                alt={image.alternativeText || `Gallery image ${figureNumber}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 90vw, 45vw"
                draggable={false}
              />
            </div>
          </div>

          {/* Caption */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <MagazineCaption
              figureNumber={figureNumber}
              text={caption}
              isExpanded={isExpanded}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
