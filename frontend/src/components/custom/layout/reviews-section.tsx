"use client";

import { useEffect, useRef, useState } from "react";
import type { IReviewsSectionProps } from "@/types";

interface ReviewsSectionComponentProps {
  data: IReviewsSectionProps;
}

const ALLOWED_SCRIPT_DOMAINS = [
  "elfsight.com",
  "elfsightcdn.com",
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
 * Parses an HTML embed code string into its widget HTML and script attributes.
 * Uses DOMParser to safely separate the two so they can be handled independently.
 * Preserves ALL script attributes (src, defer, data-use-service-core, etc.)
 * because Elfsight and other widget platforms depend on them.
 */
function parseEmbedCode(embedCode: string): {
  widgetHtml: string;
  scriptAttrs: Record<string, string> | null;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(embedCode, "text/html");

  let scriptAttrs: Record<string, string> | null = null;

  const scripts = doc.querySelectorAll("script");
  scripts.forEach((script) => {
    const src = script.getAttribute("src");
    if (src && isAllowedScriptSource(src) && !scriptAttrs) {
      scriptAttrs = {};
      Array.from(script.attributes).forEach((attr) => {
        scriptAttrs![attr.name] = attr.value;
      });
    }
    script.remove();
  });

  const widgetHtml = doc.body.innerHTML.trim();
  return { widgetHtml, scriptAttrs };
}

/**
 * Reviews/Testimonials section that embeds third-party review widgets.
 *
 * Security: Only scripts from allowlisted domains are executed.
 * Performance: Widget is lazy-loaded via IntersectionObserver.
 *
 * Script loading strategy: Manual script injection (not next/script) to:
 * - Preserve all original attributes (data-use-service-core, defer, etc.)
 * - Detect already-loaded scripts and re-initialize widgets
 * - Handle React strict mode double-execution gracefully
 */
export function ReviewsSection({ data }: ReviewsSectionComponentProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const { heading, subHeading, widgetType, widgetEmbedCode } = data;

  const [widgetHtml, setWidgetHtml] = useState<string | null>(null);
  const [scriptAttrs, setScriptAttrs] = useState<Record<string, string> | null>(
    null
  );

  // Parse embed code into widget HTML and script attributes
  useEffect(() => {
    if (!widgetEmbedCode) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[ReviewsSection] No widgetEmbedCode provided");
      }
      return;
    }

    const { widgetHtml: html, scriptAttrs: attrs } =
      parseEmbedCode(widgetEmbedCode);
    setWidgetHtml(html);
    setScriptAttrs(attrs);

    if (!attrs && process.env.NODE_ENV === "development") {
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

  // Load the platform script and initialize widgets once the div is in the DOM.
  // Handles: first load, cached script, strict mode double-execution, SPA navigation.
  useEffect(() => {
    if (!isVisible || !widgetHtml || !scriptAttrs) return;

    const src = scriptAttrs.src;
    if (!src) return;

    let pollTimer: ReturnType<typeof setInterval> | null = null;

    function tryInitWidgets(): boolean {
      if (window.eapps?.instance?.initWidgets) {
        window.eapps.instance.initWidgets();
        return true;
      }
      return false;
    }

    function pollForInit(): void {
      if (tryInitWidgets()) return;

      let attempts = 0;
      pollTimer = setInterval(() => {
        if (tryInitWidgets() || ++attempts >= 20) {
          if (pollTimer) clearInterval(pollTimer);
          pollTimer = null;
        }
      }, 500);
    }

    // Check if the script tag already exists in the DOM (cached, HMR, strict mode)
    const existingScript = Array.from(
      document.querySelectorAll("script")
    ).find((s) => s.getAttribute("src") === src);

    if (existingScript) {
      // Script already present — just re-initialize widgets
      pollForInit();
    } else {
      // Inject the script with ALL original attributes preserved
      const script = document.createElement("script");
      Object.entries(scriptAttrs).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
      script.onload = () => pollForInit();
      script.onerror = () => {
        setScriptError(true);
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[ReviewsSection] Failed to load widget script:",
            src
          );
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isVisible, widgetHtml, scriptAttrs]);

  if (!widgetEmbedCode) {
    return null;
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

        {/* Widget Container */}
        <div className="border-t-2 border-b-2 border-brand-black/20 py-8">
          {scriptError ? (
            <p className="text-center text-brand-black/50 text-sm italic">
              Reviews temporarily unavailable. Please check back later.
            </p>
          ) : (
            <div
              ref={widgetContainerRef}
              className="reviews-widget-container"
              aria-label={`${widgetType} reviews widget`}
              {...(isVisible && widgetHtml
                ? { dangerouslySetInnerHTML: { __html: widgetHtml } }
                : {})}
            />
          )}
        </div>
      </div>
    </section>
  );
}
