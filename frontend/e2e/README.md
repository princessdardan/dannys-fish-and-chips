# E2E Testing with Playwright

This directory contains end-to-end tests for Danny's Fish and Chips frontend using Playwright.

## Quick Start

### Run Tests Locally

```bash
# Run all tests in headless mode
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/home.spec.ts

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
e2e/
├── home.spec.ts          # Homepage tests
├── menu.spec.ts          # Menu page tests
├── navigation.spec.ts    # Navigation between pages
├── contact.spec.ts       # Contact page tests
└── README.md            # This file
```

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes to elements for reliable selectors
2. **Wait for Network**: Use `page.waitForLoadState('networkidle')` for dynamic content
3. **Isolate Tests**: Each test should be independent and not rely on other tests
4. **Group Related Tests**: Use `test.describe()` to group related tests
5. **Mobile Testing**: Test responsive designs with `page.setViewportSize()`

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` branch
- Pull requests to `main`
- Vercel preview deployments

### Viewing Test Results

When tests run in CI:
1. Check the "Actions" tab in GitHub
2. Click on the workflow run
3. Download the "playwright-report" artifact to view the HTML report

## Configuration

The main configuration is in [playwright.config.ts](../playwright.config.ts):

- **Base URL**: `http://localhost:3000` (local) or `PLAYWRIGHT_TEST_BASE_URL` (CI/preview)
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 retries in CI, 0 locally
- **Reporter**: HTML report in CI, list format locally

## Testing Against Different Environments

### Local Development
```bash
npm run dev  # In one terminal
npm run test:e2e  # In another terminal
```

### Against Vercel Preview
```bash
PLAYWRIGHT_TEST_BASE_URL=https://your-preview.vercel.app npm run test:e2e
```

### Against Production
```bash
PLAYWRIGHT_TEST_BASE_URL=https://dannys-fish-and-chips.vercel.app npm run test:e2e
```

## Debugging

### Visual Debugging
```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- See the browser state
- Inspect selectors
- View console logs

### Headed Mode
```bash
npm run test:e2e:headed
```

Runs tests with the browser visible.

### Screenshots and Traces

Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Traces (view with `npx playwright show-trace`)

## Useful Commands

```bash
# Generate tests interactively
npx playwright codegen http://localhost:3000

# Show HTML report
npx playwright show-report

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install

# View trace file
npx playwright show-trace trace.zip
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
