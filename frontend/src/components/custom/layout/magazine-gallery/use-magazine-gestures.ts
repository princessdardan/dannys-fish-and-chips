"use client";

import { useRef, useCallback } from "react";

interface UseMagazineGesturesOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface UseMagazineGesturesReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Touch gesture hook for horizontal swipe detection.
 *
 * Used by the magazine gallery for mobile navigation.
 * Default threshold is 60px for medium sensitivity.
 */
export function useMagazineGestures({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  enabled = true,
}: UseMagazineGesturesOptions): UseMagazineGesturesReturn {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    },
    [enabled]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || touchStartX.current === null || touchStartY.current === null) {
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Only trigger if horizontal movement is greater than vertical (prevents scroll conflicts)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= threshold) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [enabled, threshold, onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}
