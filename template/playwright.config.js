/**
 * Playwright Configuration
 *
 * End-to-end test configuration for the Pochade-JS template.
 *
 * For LLMs: Playwright tests simulate real user interactions in a headless
 * browser. They are the ultimate integration test because they exercise:
 *   - Bundling (webpack)
 *   - Server rendering (dev server or static files)
 *   - Client-side JavaScript execution
 *   - WebAssembly instantiation
 *   - Web Worker communication
 *
 * When adding a new feature, add a corresponding test in tests/.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /**
   * Directory containing test files.
   */
  testDir: './tests',

  /**
   * Unit tests (Vitest) live alongside the Playwright specs — exclude
   * them so Playwright never tries to run them.
   */
  testIgnore: '**/unit/**',

  /**
   * Run tests in files in parallel.
   * Set to false if tests share mutable state (e.g., localStorage).
   */
  fullyParallel: true,

  /**
   * Fail the build on CI if you accidentally left test.only in the source code.
   */
  forbidOnly: !!process.env.CI,

  /**
   * Retry on CI only to reduce flake from infrastructure noise.
   */
  retries: process.env.CI ? 2 : 0,

  /**
   * Opt out of parallel tests on CI for stability.
   */
  workers: process.env.CI ? 1 : undefined,

  /**
   * Reporter to use. 'html' generates a browsable report in playwright-report/.
   */
  reporter: 'html',

  /**
   * Shared settings for all projects.
   * These can be overridden per-project below.
   */
  use: {
    /**
     * Base URL to use in actions like page.goto('/').
     * Tests use relative URLs so they work against any base URL.
     */
    baseURL: 'http://localhost:3000',

    /**
     * Collect trace when retrying the failed test.
     * See https://playwright.dev/docs/trace-viewer
     */
    trace: 'on-first-retry',

    /**
     * Capture screenshots on failure for debugging.
     */
    screenshot: 'only-on-failure',
  },

  /**
   * Test projects: define different browsers and environments.
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /**
     * Production build tests.
     *
     * This project runs tests against the production build served statically.
     * It verifies that the webpack production bundle works correctly,
     * including minification, asset emission, and wasm file loading.
     *
     * Usage: npx playwright test --project=production
     */
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
    },
  ],

  /**
   * Local dev server configuration.
   *
   * Playwright will start this server automatically before running tests
   * and shut it down when tests finish.
   */
  webServer: [
    {
      command: 'npm start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    /**
     * Static server for production build tests.
     *
     * We build first, then serve the dist/ directory on a different port.
     * This ensures production tests run against the actual build output.
     */
    {
      command: 'npm run build && npx serve dist -l 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
