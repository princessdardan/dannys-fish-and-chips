'use client';

import Link from 'next/link';

/**
 * Next.js Error Boundary for [page] dynamic route.
 *
 * Catches errors in dynamic page components (menu, about-us, gallery, etc.)
 * and provides a user-friendly fallback UI.
 * Props: receives the thrown error and a reset callback from Next.js.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Error
        </h2>

        <p className="text-gray-600 mb-6">
          We encountered an error while loading this page. Please try again or return to the homepage.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left bg-red-50 p-4 rounded-lg">
            <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-700 overflow-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
