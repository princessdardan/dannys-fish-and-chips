/**
 * API Configuration
 *
 * Environment-based timeout and retry settings for API requests
 */

export const API_CONFIG = {
  timeout: {
    development: 10000,  // 10s - local dev server startup
    test: 30000,         // 30s - CI environments with cold starts
    production: 5000,    // 5s - fast or fail in production
  },
  retry: {
    enabled: false,      // Can be enabled later if needed
    maxRetries: 3,
    backoff: 'exponential' as const,
  },
} as const;

/**
 * Get API timeout based on current environment
 *
 * @returns Timeout in milliseconds
 */
export function getApiTimeout(): number {
  const env = process.env.NODE_ENV || 'development';

  // Type-safe lookup with fallback
  const timeout = API_CONFIG.timeout[env as keyof typeof API_CONFIG.timeout];

  return timeout || API_CONFIG.timeout.development;
}
