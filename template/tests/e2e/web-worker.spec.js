/**
 * Web Worker Tests
 *
 * End-to-end tests verifying web worker functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Web Workers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('worker message appears in the DOM', async ({ page }) => {
    // The example-component renders a paragraph with the worker response
    const workerParagraph = page.locator('example-component p', {
      hasText: 'Hello from Web Worker!',
    });

    await expect(workerParagraph).toBeVisible({ timeout: 10000 });
  });

  test('has no worker-related console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Filter out any non-worker errors just to be sure
    const workerErrors = consoleErrors.filter((text) =>
      text.toLowerCase().includes('worker')
    );

    expect(workerErrors).toHaveLength(0);
  });
});
