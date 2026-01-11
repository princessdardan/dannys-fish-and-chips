/**
 * Fallback UI Components
 *
 * Skeleton/loading states shown when data fails to load
 */

export function PageLoadingFallback() {
  return (
    <div className="animate-pulse p-8">
      {/* Hero section skeleton */}
      <div className="h-96 bg-gray-200 rounded-lg mb-8" />

      {/* Content section skeleton */}
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-8" />

        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function HeaderFallback() {
  return (
    <header className="h-20 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="flex gap-4">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </header>
  );
}

export function FooterFallback() {
  return (
    <footer className="h-32 bg-gray-100 border-t border-gray-200 flex items-center justify-center">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
    </footer>
  );
}

/**
 * Generic content loading skeleton
 */
export function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  );
}
