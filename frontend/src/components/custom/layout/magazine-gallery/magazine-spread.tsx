"use client";

import { cn } from "@/lib/utils";
import { TImage } from "@/types";
import { MagazinePage } from "./magazine-page";

interface MagazineSpreadProps {
  leftImage: TImage | null;
  rightImage: TImage | null;
  leftFigureNumber: number;
  rightFigureNumber: number;
  expandedCaption: number | null;
  onToggleExpand: (figureNumber: number) => void;
  isFlipping: boolean;
  flipDirection: "next" | "prev" | null;
  onClickLeft: () => void;
  onClickRight: () => void;
  isFirstSpread: boolean;
  isLastSpread: boolean;
  showBrandedBlank: boolean;
  className?: string;
}

/**
 * Two-page magazine spread with spine shadow.
 *
 * Renders left and right pages side by side with:
 * - Central spine shadow with brand-pink tint
 * - Click hotspots on page edges for navigation
 * - Support for branded blank page on odd image counts
 */
export function MagazineSpread({
  leftImage,
  rightImage,
  leftFigureNumber,
  rightFigureNumber,
  expandedCaption,
  onToggleExpand,
  isFlipping,
  flipDirection,
  onClickLeft,
  onClickRight,
  isFirstSpread,
  isLastSpread,
  showBrandedBlank,
  className,
}: MagazineSpreadProps) {
  return (
    <div
      className={cn(
        "magazine-spread relative w-full max-w-5xl mx-auto",
        "shadow-xl rounded-sm overflow-hidden",
        className
      )}
    >
      {/* Left page */}
      <MagazinePage
        image={leftImage}
        figureNumber={leftFigureNumber}
        position="left"
        isExpanded={expandedCaption === leftFigureNumber}
        onToggleExpand={() => leftImage && onToggleExpand(leftFigureNumber)}
        isFlipping={isFlipping}
        flipDirection={flipDirection}
      />

      {/* Right page */}
      <MagazinePage
        image={showBrandedBlank ? null : rightImage}
        figureNumber={rightFigureNumber}
        position="right"
        isExpanded={expandedCaption === rightFigureNumber}
        onToggleExpand={() => !showBrandedBlank && rightImage && onToggleExpand(rightFigureNumber)}
        isFlipping={isFlipping}
        flipDirection={flipDirection}
        isBrandedBlank={showBrandedBlank}
      />

      {/* Spine shadow */}
      <div className="magazine-spine" aria-hidden="true" />

      {/* Navigation hotspots */}
      {!isFirstSpread && (
        <button
          className="magazine-hotspot magazine-hotspot-left"
          onClick={onClickLeft}
          aria-label="Go to previous spread"
        />
      )}
      {!isLastSpread && (
        <button
          className="magazine-hotspot magazine-hotspot-right"
          onClick={onClickRight}
          aria-label="Turn to next spread"
        />
      )}
    </div>
  );
}
