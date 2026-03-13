"use client";

import { useEffect, useRef, useState } from "react";
import type { IReviewsSectionProps } from "@/types";

interface ReviewsSectionComponentProps {
  data: IReviewsSectionProps;
}

const ALLOWED_SCRIPT_DOMAINS = [
  "elfsight.com",
  "google.com",
  "googleapis.com",
  "tripadvisor.com",
  "yelp.com",
];

function isAllowedScriptSource(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_SCRIPT_DOMAINS.some((domain) =>
      url.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
}

/**
 * Reviews/Testimonials section that embeds third-party review widgets.
 *
 * Supports:
 * - Elfsight widgets (recommended - free tier available)
 * - Google Reviews via embed code
 * - TripAdvisor widgets
 * - Custom embed codes
 *
 * Security: Only scripts from allowlisted domains are executed.
 * Performance: Widget is lazy-loaded via IntersectionObserver.
 */
export function ReviewsSection({ data }: ReviewsSectionComponentProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { heading, subHeading, widgetType, widgetEmbedCode } = data;

  // Lazy-load: observe the section and flip `isVisible` when near viewport
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Inject the widget HTML and execute allowed scripts once visible
  useEffect(() => {
    if (!isVisible || !containerRef.current || !widgetEmbedCode) return;

    const container = containerRef.current;
    container.innerHTML = widgetEmbedCode;

    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const src = oldScript.getAttribute("src");

      // Block scripts from untrusted domains
      if (src && !isAllowedScriptSource(src)) {
        oldScript.remove();
        return;
      }

      const newScript = document.createElement("script");

      // Copy attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy inline script content
      newScript.textContent = oldScript.textContent;

      // Replace old script with new one to execute it
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Cleanup on unmount
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [isVisible, widgetEmbedCode]);

  // Don't render if no embed code provided
  if (!widgetEmbedCode) {
    return null;
  }

  return (
    <section ref={sectionRef} className="bg-background py-16">
      <div className="section-container-cream">
        {/* Section Header */}
        <div className="text-center mb-12">
          {heading && <h2 className="section-heading-red-center">{heading}</h2>}
          {subHeading && (
            <p className="text-brand-red font-serif text-lg italic">
              {subHeading}
            </p>
          )}
        </div>

        {/* Widget Container — newspaper "readers write" frame */}
        <div className="border-t-2 border-b-2 border-brand-black/20 py-8">
          <div
            ref={containerRef}
            className="reviews-widget-container"
            aria-label={`${widgetType} reviews widget`}
          />
        </div>
      </div>
    </section>
  );
}
