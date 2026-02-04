import { cn } from "@/lib/utils";

interface MagazineNavigationProps {
  currentSpread: number;
  totalSpreads: number;
  onPrevious: () => void;
  onNext: () => void;
  isMobile?: boolean;
  className?: string;
}

/**
 * Convert number to Roman numerals for page numbering.
 */
function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  let remaining = num;

  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result || "0";
}

/**
 * Magazine navigation controls with vintage styling.
 *
 * Desktop: "← Previous" / "Turn page →" with Roman numeral indicator
 * Mobile: Compact "← / →" arrows
 */
export function MagazineNavigation({
  currentSpread,
  totalSpreads,
  onPrevious,
  onNext,
  isMobile = false,
  className,
}: MagazineNavigationProps) {
  const isFirstSpread = currentSpread === 0;
  const isLastSpread = currentSpread >= totalSpreads - 1;
  const currentRoman = toRomanNumeral(currentSpread + 1);
  const totalRoman = toRomanNumeral(totalSpreads);

  if (isMobile) {
    return (
      <nav
        className={cn("flex items-center justify-center gap-8 py-4", className)}
        aria-label="Gallery navigation"
      >
        <button
          onClick={onPrevious}
          disabled={isFirstSpread}
          className="magazine-nav-button text-2xl"
          aria-label="Previous page"
        >
          ←
        </button>
        <span className="magazine-page-indicator">
          {currentRoman} / {totalRoman}
        </span>
        <button
          onClick={onNext}
          disabled={isLastSpread}
          className="magazine-nav-button text-2xl"
          aria-label="Next page"
        >
          →
        </button>
      </nav>
    );
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-6 py-4", className)}
      aria-label="Gallery navigation"
    >
      <button
        onClick={onPrevious}
        disabled={isFirstSpread}
        className="magazine-nav-button"
        aria-label="Go to previous spread"
      >
        ← Previous
      </button>
      <span className="magazine-page-indicator">
        Page {currentRoman} of {totalRoman}
      </span>
      <button
        onClick={onNext}
        disabled={isLastSpread}
        className="magazine-nav-button"
        aria-label="Turn to next spread"
      >
        Turn page →
      </button>
    </nav>
  );
}
