/**
 * Counter Component Tests
 *
 * End-to-end tests for the counter-component custom element.
 */

import { test, expect } from '@playwright/test';

test.describe('Counter Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders with initial count of 0', async ({ page }) => {
    const display = page.locator('counter-component .counter-display');
    await expect(display).toHaveText('0');
  });

  test('increments when + button is clicked', async ({ page }) => {
    const display = page.locator('counter-component .counter-display');
    const incrementButton = page.locator('counter-component button', { hasText: '+' });

    await incrementButton.click();
    await expect(display).toHaveText('1');

    await incrementButton.click();
    await expect(display).toHaveText('2');
  });

  test('decrements when - button is clicked', async ({ page }) => {
    const display = page.locator('counter-component .counter-display');
    const decrementButton = page.locator('counter-component button', { hasText: '-' });

    await decrementButton.click();
    await expect(display).toHaveText('-1');
  });

  test('resets to 0 when Reset button is clicked', async ({ page }) => {
    const display = page.locator('counter-component .counter-display');
    const incrementButton = page.locator('counter-component button', { hasText: '+' });
    const resetButton = page.locator('counter-component button', { hasText: 'Reset' });

    await incrementButton.click();
    await incrementButton.click();
    await expect(display).toHaveText('2');

    await resetButton.click();
    await expect(display).toHaveText('0');
  });

  test('emits count-changed event', async ({ page }) => {
    // Set up event listener before interacting
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const el = document.querySelector('counter-component');
        if (!el) {
          resolve(null);
          return;
        }
        el.addEventListener('count-changed', (e) => {
          resolve(e.detail);
        }, { once: true });
      });
    });

    const incrementButton = page.locator('counter-component button', { hasText: '+' });
    await incrementButton.click();

    const detail = await eventPromise;
    expect(detail).not.toBeNull();
    expect(detail.count).toBe(1);
  });
});
