"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { TImage } from "@/types";
import { MagazineSpread } from "./magazine-spread";
import { MagazinePage } from "./magazine-page";
import { MagazineNavigation } from "./magazine-navigation";
import { useMagazineGestures } from "./use-magazine-gestures";

interface MagazineGalleryProps {
  images: TImage[];
  className?: string;
}

/**
 * Hook to detect prefers-reduced-motion using useSyncExternalStore.
 */
function useReducedMotion(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to detect mobile viewport using useSyncExternalStore.
 */
function useIsMobile(breakpoint = 768): boolean {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return window.innerWidth < breakpoint;
  }, [breakpoint]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Magazine-style gallery with vintage broadsheet aesthetic.
 *
 * Features:
 * - Two-page spread on desktop, single page on mobile
 * - Page-turning navigation with keyboard support
 * - Touch gestures for mobile swiping
 * - Reduced motion support
 * - Roman numeral page numbering
 * - Click images to expand captions
 */
export function MagazineGallery({ images, className }: MagazineGalleryProps) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // For mobile single-page view
  const [expandedCaption, setExpandedCaption] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // Calculate spreads (2 images per spread on desktop)
  const totalSpreads = Math.ceil(images.length / 2);
  const totalPages = images.length;
  const hasOddImages = images.length % 2 !== 0;

  const goToNextSpread = useCallback(() => {
    if (currentSpread >= totalSpreads - 1 || isFlipping) return;

    setFlipDirection("next");
    setIsFlipping(true);
    setExpandedCaption(null);

    const timeout = prefersReducedMotion ? 150 : 300;
    setTimeout(() => {
      setCurrentSpread((prev) => prev + 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, timeout);
  }, [currentSpread, totalSpreads, isFlipping, prefersReducedMotion]);

  const goToPrevSpread = useCallback(() => {
    if (currentSpread <= 0 || isFlipping) return;

    setFlipDirection("prev");
    setIsFlipping(true);
    setExpandedCaption(null);

    const timeout = prefersReducedMotion ? 150 : 300;
    setTimeout(() => {
      setCurrentSpread((prev) => prev - 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, timeout);
  }, [currentSpread, isFlipping, prefersReducedMotion]);

  const goToNextPage = useCallback(() => {
    if (currentPage >= totalPages - 1 || isFlipping) return;

    setFlipDirection("next");
    setIsFlipping(true);
    setExpandedCaption(null);

    const timeout = prefersReducedMotion ? 150 : 300;
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, timeout);
  }, [currentPage, totalPages, isFlipping, prefersReducedMotion]);

  const goToPrevPage = useCallback(() => {
    if (currentPage <= 0 || isFlipping) return;

    setFlipDirection("prev");
    setIsFlipping(true);
    setExpandedCaption(null);

    const timeout = prefersReducedMotion ? 150 : 300;
    setTimeout(() => {
      setCurrentPage((prev) => prev - 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, timeout);
  }, [currentPage, isFlipping, prefersReducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isMobile) {
          goToNextPage();
        } else {
          goToNextSpread();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isMobile) {
          goToPrevPage();
        } else {
          goToPrevSpread();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, goToNextSpread, goToPrevSpread, goToNextPage, goToPrevPage]);

  // Touch gestures for mobile
  const { onTouchStart, onTouchEnd } = useMagazineGestures({
    onSwipeLeft: goToNextPage,
    onSwipeRight: goToPrevPage,
    enabled: isMobile,
  });

  const handleToggleExpand = (figureNumber: number) => {
    setExpandedCaption((prev) => (prev === figureNumber ? null : figureNumber));
  };

  // Get current images for the spread
  const leftIndex = currentSpread * 2;
  const rightIndex = currentSpread * 2 + 1;
  const leftImage = images[leftIndex] || null;
  const rightImage = images[rightIndex] || null;
  const showBrandedBlank = hasOddImages && currentSpread === totalSpreads - 1;

  // Mobile view
  if (isMobile) {
    const currentImage = images[currentPage];

    return (
      <div
        className={cn("magazine-container", className)}
        role="region"
        aria-label="Photo gallery"
        aria-live="polite"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="px-4">
          <div
            className={cn(
              "magazine-paper shadow-lg rounded-sm overflow-hidden max-w-md mx-auto",
              prefersReducedMotion && isFlipping && flipDirection === "next" && "magazine-reduced-motion-slide-left",
              prefersReducedMotion && isFlipping && flipDirection === "prev" && "magazine-reduced-motion-slide-right"
            )}
          >
            <MagazinePage
              image={currentImage}
              figureNumber={currentPage + 1}
              position="left"
              isExpanded={expandedCaption === currentPage + 1}
              onToggleExpand={() => handleToggleExpand(currentPage + 1)}
              isFlipping={isFlipping && !prefersReducedMotion}
              flipDirection={flipDirection}
            />
          </div>
        </div>

        <MagazineNavigation
          currentSpread={currentPage}
          totalSpreads={totalPages}
          onPrevious={goToPrevPage}
          onNext={goToNextPage}
          isMobile
        />

        <p className="sr-only">
          Showing image {currentPage + 1} of {totalPages}. Use arrow keys or swipe to navigate.
        </p>
      </div>
    );
  }

  // Desktop view
  return (
    <div
      className={cn("magazine-container", className)}
      role="region"
      aria-label="Photo gallery"
      aria-live="polite"
    >
      <div
        className={cn(
          prefersReducedMotion && isFlipping && flipDirection === "next" && "magazine-reduced-motion-slide-left",
          prefersReducedMotion && isFlipping && flipDirection === "prev" && "magazine-reduced-motion-slide-right"
        )}
      >
        <MagazineSpread
          leftImage={leftImage}
          rightImage={rightImage}
          leftFigureNumber={leftIndex + 1}
          rightFigureNumber={rightIndex + 1}
          expandedCaption={expandedCaption}
          onToggleExpand={handleToggleExpand}
          isFlipping={isFlipping && !prefersReducedMotion}
          flipDirection={flipDirection}
          onClickLeft={goToPrevSpread}
          onClickRight={goToNextSpread}
          isFirstSpread={currentSpread === 0}
          isLastSpread={currentSpread >= totalSpreads - 1}
          showBrandedBlank={showBrandedBlank}
        />
      </div>

      <MagazineNavigation
        currentSpread={currentSpread}
        totalSpreads={totalSpreads}
        onPrevious={goToPrevSpread}
        onNext={goToNextSpread}
      />

      <p className="sr-only">
        Showing spread {currentSpread + 1} of {totalSpreads}. Use arrow keys to navigate.
      </p>
    </div>
  );
}
