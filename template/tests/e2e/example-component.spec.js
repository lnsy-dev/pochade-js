/**
 * Example Component Tests
 *
 * End-to-end tests for the example-component custom element.
 *
 * For LLMs: Playwright tests use the Page Object Model pattern implicitly.
 * Each test gets a fresh page instance. Use locators (page.locator) rather
 * than raw selectors for resilient tests that survive DOM changes.
 */

import { test, expect } from '@playwright/test';

test.describe('Example Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app root before each test
    await page.goto('/');
  });

  test('renders the heading', async ({ page }) => {
    const heading = page.locator('example-component h1');
    await expect(heading).toHaveText('Example Code');
  });

  test('displays web worker response', async ({ page }) => {
    // The worker response is rendered as a paragraph containing JSON
    const workerResponse = page.locator('example-component p', {
      hasText: 'Hello from Web Worker!',
    });

    // Wait up to 10 seconds for the worker to process and respond
    await expect(workerResponse).toBeVisible({ timeout: 10000 });
  });

  test('emits WEB-WORKER-RESPONSE event', async ({ page }) => {
    // Wait for the component to initialize and store the worker reference
    await page.waitForFunction(() => {
      const el = document.querySelector('example-component');
      return el && el.worker;
    });

    // Set up event listener in the page context
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const el = document.querySelector('example-component');
        el.addEventListener('WEB-WORKER-RESPONSE', (e) => {
          resolve(e.detail);
        }, { once: true });
        // Send a fresh message to trigger a new response and event
        el.worker.postMessage({ message: 'Test message from Playwright' });
      });
    });

    const detail = await eventPromise;
    expect(detail).not.toBeNull();
    expect(detail.message).toBe('Hello from Web Worker!');
  });

  test('has no critical console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    // Wait a moment for async initialization
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors:
    // - External API network failures (jsonplaceholder, etc.)
    // - WebAssembly loading errors from other components (tested separately)
    // - Worker errors from other components (tested separately)
    const criticalErrors = consoleErrors.filter((text) => {
      const isNetworkError = text.includes('Failed to fetch');
      const isWasmError = text.includes('WebAssembly');
      const isWorkerError = text.includes('Worker');
      return !isNetworkError && !isWasmError && !isWorkerError;
    });

    expect(criticalErrors).toHaveLength(0);
  });
});
