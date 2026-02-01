"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";

interface HeaderWrapperProps {
  children: React.ReactNode;
}

const HeaderContext = createContext({ isActive: false });

/**
 * Access header state (active vs. idle) for styling.
 */
export const useHeaderContext = () => useContext(HeaderContext);

/**
 * Wraps the header and manages scroll/hover visibility behavior.
 *
 * Side effects: listens to `scroll` and `load` events on `window`.
 */
export function HeaderWrapper({ children }: HeaderWrapperProps) {
  const pathname = usePathname();
  const isGalleryPage = pathname === "/gallery";
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isActive = isScrolled || isHovered;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state
      setIsScrolled(currentScrollY > 50);

      // Hide when scrolling down past 100px, show on scroll up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide
          setIsVisible(false);
        } else {
          // Scrolling up - show
          setIsVisible(true);
        }
      } else {
        // At top of page - always show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <HeaderContext.Provider value={{ isActive }}>
      <div
        className={`z-50 w-full flex flex-col items-center px-4 shadow-md transition-all duration-300 bg-alt-background backdrop-blur-sm ${isGalleryPage ? "fixed top-0" : "fixed md:sticky top-0"}  ${!isVisible ? (isGalleryPage ? "-translate-y-full" : "md:translate-y-0 -translate-y-full") : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
    </HeaderContext.Provider>
  );
}
