import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const LOADING_FILE = path.resolve(__dirname, '../src/app/(site)/loading.tsx');
const FALLBACK_FILE = path.resolve(__dirname, '../src/components/ui/fallback-ui.tsx');
const FALSE_404_COPY = [/\b404\b/i, /page\s+not\s+found/i, /go\s+home/i, /go\s+back/i];

test.describe('Route loading UI regression', () => {
  test('route loading file must not contain false 404 messaging', () => {
    const source = readFileSync(LOADING_FILE, 'utf8');

    // Guard against the copy-paste bug where loading.tsx was a duplicate of
    // the 404 page. The browser loading state is transient, so source-level
    // coverage keeps this regression deterministic.
    for (const pattern of FALSE_404_COPY) {
      expect(source).not.toMatch(pattern);
    }
    expect(source).toMatch(/return\s+<PageLoadingFallback\s*\/?>\s*;/);
  });

  test('resolved loading fallback must not contain false 404 messaging', () => {
    const source = readFileSync(FALLBACK_FILE, 'utf8');

    for (const pattern of FALSE_404_COPY) {
      expect(source).not.toMatch(pattern);
    }
  });
});
