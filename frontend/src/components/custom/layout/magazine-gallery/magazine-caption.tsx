import { cn } from "@/lib/utils";

interface MagazineCaptionProps {
  figureNumber: number;
  text: string;
  isExpanded?: boolean;
  maxLength?: number;
  className?: string;
}

/**
 * Truncate text at a word boundary.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

/**
 * Convert number to Roman numerals for figure numbering.
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

  return result;
}

/**
 * Magazine-style figure caption with vintage typography.
 *
 * Format: "Fig. I — Caption text..."
 * Truncates at ~100 characters with ellipsis when not expanded.
 */
export function MagazineCaption({
  figureNumber,
  text,
  isExpanded = false,
  maxLength = 100,
  className,
}: MagazineCaptionProps) {
  const displayText = isExpanded ? text : truncateText(text, maxLength);
  const romanNumeral = toRomanNumeral(figureNumber);
  const isTruncated = !isExpanded && text.length > maxLength;

  return (
    <p className={cn("magazine-caption", className)}>
      <span className="magazine-caption-figure">Fig. {romanNumeral}</span>
      <span aria-hidden="true"> — </span>
      <span className={cn(isTruncated && "cursor-pointer")}>{displayText}</span>
    </p>
  );
}
