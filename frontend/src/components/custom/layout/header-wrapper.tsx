"use client";

import { useEffect, useState, useRef, useCallback, createContext, useContext, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface HeaderWrapperProps {
  children: React.ReactNode;
}

const HeaderContext = createContext({ isActive: false });

/**
 * Access header state (active vs. idle) for styling.
 */
export const useHeaderContext = () => useContext(HeaderContext);

// Configuration constants
const SCROLL_THRESHOLD = 100; // px before hide/show behavior activates
const SCROLL_DELTA_THRESHOLD = 5; // minimum scroll delta to trigger visibility change
const INACTIVITY_TIMEOUT_MS = 4000; // hide after 4 seconds of inactivity

// Subscribe to scroll position for initial "scrolled" state
function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const getScrolledSnapshot = () => window.scrollY > 50;
const getScrolledServerSnapshot = () => false;

// Subscribe to reduced motion preference
function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}
const getReducedMotionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionServerSnapshot = () => false;

/**
 * Wraps the header and manages scroll/hover visibility behavior.
 *
 * Behavior:
 * - Always visible at top of page (scrollY < 100)
 * - Hides on scroll down, shows on scroll up
 * - Auto-hides after 4 seconds of inactivity when scrolled
 * - Hover reveals header and pauses inactivity timer
 * - Respects prefers-reduced-motion accessibility setting
 */
export function HeaderWrapper({ children }: HeaderWrapperProps) {
  // External browser state via useSyncExternalStore (hydration-safe)
  const isScrolled = useSyncExternalStore(subscribeToScroll, getScrolledSnapshot, getScrolledServerSnapshot);
  const prefersReducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);

  // Internal component state
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Refs for scroll tracking
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const isActive = isScrolled || isHovered;

  // Clear inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  // Start inactivity timer
  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();

    // Only start timer if scrolled past threshold and not hovering
    if (lastScrollY.current > SCROLL_THRESHOLD && !isHovered) {
      inactivityTimer.current = setTimeout(() => {
        setIsVisible(false);
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [clearInactivityTimer, isHovered]);

  // Handle scroll with requestAnimationFrame for performance
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Restart inactivity timer on any scroll
    startInactivityTimer();

    // Determine visibility based on scroll direction
    if (currentScrollY <= SCROLL_THRESHOLD) {
      // At top of page - always show
      setIsVisible(true);
    } else if (Math.abs(scrollDelta) > SCROLL_DELTA_THRESHOLD) {
      if (scrollDelta > 0) {
        // Scrolling down - hide
        setIsVisible(false);
      } else {
        // Scrolling up - show
        setIsVisible(true);
      }
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [startInactivityTimer]);

  // Debounced scroll listener using requestAnimationFrame
  const onScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(handleScroll);
      ticking.current = true;
    }
  }, [handleScroll]);

  // Set up scroll listener
  useEffect(() => {
    // Initialize scroll position ref
    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInactivityTimer();
    };
  }, [onScroll, clearInactivityTimer]);

  // Handle hover state changes
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsVisible(true);
    clearInactivityTimer();
  }, [clearInactivityTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    startInactivityTimer();
  }, [startInactivityTimer]);

  // Compute transition classes - respect reduced motion preference
  const transitionClasses = prefersReducedMotion
    ? ""
    : "transition-[transform,opacity] duration-300 ease-out";

  // Visibility transform and opacity
  const visibilityClasses = !isVisible
    ? "-translate-y-full opacity-0"
    : "translate-y-0 opacity-100";

  return (
    <HeaderContext.Provider value={{ isActive }}>
      <div
        className={cn(
          "z-50 w-full flex flex-col items-center masthead-bg",
          "fixed top-0",
          transitionClasses,
          visibilityClasses,
          "will-change-transform"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </HeaderContext.Provider>
  );
}
