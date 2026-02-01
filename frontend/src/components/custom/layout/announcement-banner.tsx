"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import type { TAnnouncement } from "@/types";

interface AnnouncementBannerProps {
  data: TAnnouncement | null;
}

const STORAGE_KEY = "dismissedAnnouncementId";

/**
 * Custom hook to sync dismissed state with localStorage.
 * Uses useSyncExternalStore for proper SSR/hydration handling.
 */
function useDismissedState(documentId: string | undefined) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (!documentId) return true;
    return localStorage.getItem(STORAGE_KEY) === documentId;
  }, [documentId]);

  const getServerSnapshot = useCallback(() => true, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Site-wide announcement banner displayed above the header.
 *
 * Features:
 * - Customizable background/text colors from CMS
 * - Optional call-to-action link
 * - Dismissible with localStorage persistence
 * - Time-bound display (filtered server-side)
 */
export function AnnouncementBanner({ data }: AnnouncementBannerProps) {
  const isDismissedFromStorage = useDismissedState(data?.documentId);
  const [isDismissedLocal, setIsDismissedLocal] = useState(false);

  const isDismissed = isDismissedFromStorage || isDismissedLocal;

  // Don't render anything if no data or dismissed
  if (!data || isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, data.documentId);
    setIsDismissedLocal(true);
  };

  return (
    <div
      className="w-full py-3 px-4 text-center relative"
      style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
      role="banner"
      aria-label="Site announcement"
    >
      <p className="text-sm md:text-base font-medium pr-8">
        {data.message}
        {data.linkText && data.linkUrl && (
          <>
            {" "}
            <Link
              href={data.linkUrl}
              className="underline hover:no-underline font-semibold"
              style={{ color: data.textColor }}
            >
              {data.linkText}
            </Link>
          </>
        )}
      </p>
      {data.isDismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
          style={{ color: data.textColor }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
