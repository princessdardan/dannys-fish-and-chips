"use client";

import { useEffect, useRef } from "react";
import type { IReviewsSectionProps } from "@/types";

interface ReviewsSectionComponentProps {
  data: IReviewsSectionProps;
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
 * The widget is lazy-loaded to avoid blocking page render.
 */
export function ReviewsSection({ data }: ReviewsSectionComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { heading, subHeading, widgetType, widgetEmbedCode } = data;

  useEffect(() => {
    if (!containerRef.current || !widgetEmbedCode) return;

    // Parse and execute any scripts in the embed code
    const container = containerRef.current;
    container.innerHTML = widgetEmbedCode;

    // Find and execute any script tags
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
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
  }, [widgetEmbedCode]);

  // Don't render if no embed code provided
  if (!widgetEmbedCode) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {heading && (
            <h2 className="text-4xl md:text-5xl font-bold text-heading-text mb-4">
              {heading}
            </h2>
          )}
          {subHeading && (
            <p className="text-brand-red font-serif text-lg italic">
              {subHeading}
            </p>
          )}
        </div>

        {/* Widget Container */}
        <div
          ref={containerRef}
          className="reviews-widget-container"
          aria-label={`${widgetType} reviews widget`}
        />
      </div>
    </section>
  );
}
