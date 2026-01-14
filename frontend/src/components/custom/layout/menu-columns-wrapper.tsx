"use client";

import { useEffect, useRef, useState, ReactNode, Children } from "react";

interface MenuColumnsWrapperProps {
  children: ReactNode;
}

export function MenuColumnsWrapper({ children }: MenuColumnsWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [borders, setBorders] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const calculateBorders = () => {
      if (!containerRef.current) return;

      const items = Array.from(containerRef.current.children) as HTMLElement[];
      const newBorders = new Map<number, string>();

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const classes: string[] = [];

        // Check for right neighbor - an item that starts near where this one ends horizontally
        // and overlaps vertically
        const hasRightNeighbor = items.some((other, otherIndex) => {
          if (otherIndex === index) return false;
          const otherRect = other.getBoundingClientRect();
          // Items are horizontally adjacent if:
          // - The other item's left edge is close to this item's right edge
          // - They overlap vertically (share some vertical space)
          const horizontallyAdjacent = Math.abs(otherRect.left - rect.right) < 40;
          const verticallyOverlapping =
            rect.top < otherRect.bottom && rect.bottom > otherRect.top;
          return horizontallyAdjacent && verticallyOverlapping;
        });

        // Check for bottom neighbor - an item that starts near where this one ends vertically
        // and overlaps horizontally
        const hasBottomNeighbor = items.some((other, otherIndex) => {
          if (otherIndex === index) return false;
          const otherRect = other.getBoundingClientRect();
          // Items are vertically adjacent if:
          // - The other item's top edge is close to this item's bottom edge
          // - They overlap horizontally (share some horizontal space)
          const verticallyAdjacent = Math.abs(otherRect.top - rect.bottom) < 40;
          const horizontallyOverlapping =
            rect.left < otherRect.right && rect.right > otherRect.left;
          return verticallyAdjacent && horizontallyOverlapping;
        });

        if (hasRightNeighbor) classes.push("has-right-neighbor");
        if (hasBottomNeighbor) classes.push("has-bottom-neighbor");

        newBorders.set(index, classes.join(" "));
      });

      setBorders(newBorders);
    };

    // Initial calculation after render
    calculateBorders();

    // Recalculate on resize
    window.addEventListener("resize", calculateBorders);

    // Also recalculate after images/fonts load which may affect layout
    window.addEventListener("load", calculateBorders);

    return () => {
      window.removeEventListener("resize", calculateBorders);
      window.removeEventListener("load", calculateBorders);
    };
  }, [children]);

  const childArray = Children.toArray(children);

  return (
    <div
      ref={containerRef}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
    >
      {childArray.map((child, index) => {
        const classes = borders.get(index) || "";
        const hasRight = classes.includes("has-right-neighbor");
        const hasBottom = classes.includes("has-bottom-neighbor");

        return (
          <div
            key={index}
            className="break-inside-avoid w-full"
          >
            <div className={`border-brand-black ${hasRight ? "border-r pr-4 md:pr-6" : ""} ${hasBottom ? "pb-4 md:pb-6" : ""}`}>
              {child}
            </div>
            {hasBottom && (
              <div className="border-b border-brand-black -ml-3.25 md:-ml-4.25" />
            )}
          </div>
        );
      })}
    </div>
  );
}
