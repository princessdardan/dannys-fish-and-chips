"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
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
 * Parses an HTML embed code string into its widget HTML and script URL.
 * Uses DOMParser to safely separate the two so they can be handled independently.
 */
function parseEmbedCode(embedCode: string): {
  widgetHtml: string;
  scriptSrc: string | null;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(embedCode, "text/html");

  let scriptSrc: string | null = null;

  // Extract the first allowed script src
  const scripts = doc.querySelectorAll("script");
  scripts.forEach((script) => {
    const src = script.getAttribute("src");
    if (src && isAllowedScriptSource(src) && !scriptSrc) {
      scriptSrc = src;
    }
    script.remove();
  });

  // Remaining HTML is the widget div(s)
  const widgetHtml = doc.body.innerHTML.trim();

  return { widgetHtml, scriptSrc };
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
  const [isVisible, setIsVisible] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const { heading, subHeading, widgetType, widgetEmbedCode } = data;

  // Parse embed code into widget HTML and script URL
  const [widgetHtml, setWidgetHtml] = useState<string | null>(null);
  const [scriptSrc, setScriptSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!widgetEmbedCode) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[ReviewsSection] No widgetEmbedCode provided");
      }
      return;
    }

    const { widgetHtml: html, scriptSrc: src } =
      parseEmbedCode(widgetEmbedCode);
    setWidgetHtml(html);
    setScriptSrc(src);

    if (!src && process.env.NODE_ENV === "development") {
      console.warn(
        "[ReviewsSection] No allowed script source found in embed code. Allowed domains:",
        ALLOWED_SCRIPT_DOMAINS
      );
    }
  }, [widgetEmbedCode]);

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

  // Don't render if no embed code provided
  if (!widgetEmbedCode) {
    return null;
  }

  function handleScriptLoad(): void {
    // Force Elfsight to re-scan for widget divs added after initial load
    if (window.eapps?.instance?.initWidgets) {
      window.eapps.instance.initWidgets();
    }
  }

  function handleScriptError(): void {
    setScriptError(true);
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[ReviewsSection] Failed to load widget script:",
        scriptSrc
      );
    }
  }

  return (
    <section ref={sectionRef} className="bg-background">
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
          {scriptError ? (
            <p className="text-center text-brand-black/50 text-sm italic">
              Reviews temporarily unavailable. Please check back later.
            </p>
          ) : (
            <div
              className="reviews-widget-container"
              aria-label={`${widgetType} reviews widget`}
              {...(isVisible && widgetHtml
                ? { dangerouslySetInnerHTML: { __html: widgetHtml } }
                : {})}
            />
          )}
        </div>
      </div>

      {/* Load widget script via next/script for proper deduplication and lifecycle */}
      {isVisible && scriptSrc && (
        <Script
          src={scriptSrc}
          strategy="afterInteractive"
          onLoad={handleScriptLoad}
          onError={handleScriptError}
        />
      )}
    </section>
  );
}
