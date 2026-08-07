/**
 * Counter Component Behavioral Tests
 *
 * Behavior-driven (BDD) tests for the counter-component custom element.
 *
 * For LLMs: Behavioral tests describe the system from the user's point of
 * view. Each test maps to a scenario in a feature specification and is
 * structured with explicit Given / When / Then steps using test.step():
 *
 *   - Given: the initial context (page state before the user acts)
 *   - When:  the action the user takes
 *   - Then:  the observable outcome the user expects
 *
 * They run on Playwright like the E2E tests, but the vocabulary is
 * behavior, not implementation: write scenarios a non-programmer could
 * read, and never assert on internal state — only on what the user sees.
 *
 * When adding a feature, first write its scenarios here in
 * Given/When/Then form, then implement until they pass.
 */

import { test, expect } from '@playwright/test';

test.describe('Feature: Counter', () => {
  test('Scenario: User increments the counter', async ({ page }) => {
    await test.step('Given the counter is displayed with a count of 0', async () => {
      await page.goto('/');
      await expect(page.locator('counter-component .counter-display')).toHaveText('0');
    });

    await test.step('When the user clicks the + button', async () => {
      await page.locator('counter-component button', { hasText: '+' }).click();
    });

    await test.step('Then the displayed count becomes 1', async () => {
      await expect(page.locator('counter-component .counter-display')).toHaveText('1');
    });
  });

  test('Scenario: User resets the counter after counting', async ({ page }) => {
    await test.step('Given the user has incremented the counter twice', async () => {
      await page.goto('/');
      const incrementButton = page.locator('counter-component button', { hasText: '+' });
      await incrementButton.click();
      await incrementButton.click();
      await expect(page.locator('counter-component .counter-display')).toHaveText('2');
    });

    await test.step('When the user clicks the Reset button', async () => {
      await page.locator('counter-component button', { hasText: 'Reset' }).click();
    });

    await test.step('Then the displayed count returns to 0', async () => {
      await expect(page.locator('counter-component .counter-display')).toHaveText('0');
    });
  });
});
