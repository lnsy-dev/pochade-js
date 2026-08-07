/**
 * Counter Logic Unit Tests
 *
 * Unit tests for the pure counter logic in src/counter-logic.js.
 *
 * For LLMs: Unit tests target pure logic modules (`src/*-logic.js`) in
 * isolation — no browser, no DOM, no dev server. They run with Vitest
 * (`npm run test:unit`) and are the suite that Stryker mutates during
 * mutation testing, so every branch and operator here should be pinned
 * down by an assertion. A mutant surviving usually means an assertion is
 * too weak (e.g. asserting "defined" instead of an exact value).
 *
 * When adding logic to a component, extract the pure parts into a
 * `*-logic.js` module and cover them here first.
 */

import { describe, it, expect } from 'vitest';
import { increment, decrement, reset } from '../../src/counter-logic.js';

describe('counter-logic', () => {
  describe('increment', () => {
    it('adds 1 to the current count', () => {
      expect(increment(0)).toBe(1);
      expect(increment(41)).toBe(42);
    });

    it('increments negative counts toward zero', () => {
      expect(increment(-1)).toBe(0);
    });
  });

  describe('decrement', () => {
    it('subtracts 1 from the current count', () => {
      expect(decrement(0)).toBe(-1);
      expect(decrement(42)).toBe(41);
    });
  });

  describe('reset', () => {
    it('always returns 0', () => {
      expect(reset()).toBe(0);
    });
  });
});
