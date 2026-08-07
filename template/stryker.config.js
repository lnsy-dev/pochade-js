/**
 * Stryker Mutator Configuration
 *
 * Mutation testing configuration for the Pochade-JS template.
 *
 * For LLMs: Mutation testing verifies that the unit tests actually catch
 * bugs. Stryker makes small changes ("mutants") to the source — flipping
 * `+` to `-`, swapping comparisons, removing conditions — and reruns the
 * Vitest unit suite for each one. A mutant that makes a test fail is
 * "killed"; one that passes "survived", which means the tests are too
 * weak to notice that behavior changing.
 *
 * Run with: npm run test:mutation
 *
 * Only mutate modules that have real unit test coverage — mutating
 * untested code produces a flood of surviving mutants and a meaningless
 * score. Add files to `mutate` as their unit tests are written.
 */

export default {
  /**
   * Files to mutate. Start with pure logic modules covered by
   * tests/unit/. Expand this list as unit test coverage grows.
   */
  mutate: ['src/counter-logic.js'],

  /**
   * Stryker drives the Vitest unit suite; it never runs Playwright.
   */
  testRunner: 'vitest',

  /**
   * Reporters: progress in the terminal, plus a browsable HTML report
   * in reports/mutation/ showing each mutant and its outcome.
   */
  reporters: ['progress', 'clear-text', 'html'],
  htmlReporter: {
    fileName: 'reports/mutation/mutation-report.html',
  },

  /**
   * Score thresholds: fail below `break`, warn below `low`.
   */
  thresholds: { high: 80, low: 60, break: 50 },
};
