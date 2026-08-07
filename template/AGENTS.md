# Agent Conventions for Pochade-JS Projects

This file governs all code in this directory and its subdirectories.

## Technology Stack

- **JavaScript**: Vanilla ES2020+ (no frameworks)
- **CSS**: Standard CSS with variables (no CSS-in-JS, no Shadow DOM)
- **Build Tool**: Webpack 5 with SWC transpilation
- **Custom Elements**: dataroom-js (extends HTMLElement)
- **Workers**: Web Workers with custom inline bundling
- **WebAssembly**: C++ via Emscripten, Rust via wasm-pack
<!-- <TESTING-ANY> -->
- **Testing**: see the Testing section below
<!-- </TESTING-ANY> -->

## Code Style

### Comments

Use **DocBlock style comments** for all classes, methods, and exported functions:

```javascript
/**
 * Brief description.
 *
 * @param {string} paramName Description
 * @returns {number} Description
 */
```

Use inline `//` comments for implementation logic.

### Custom Elements

```javascript
import DataroomElement from 'dataroom-js';

class MyComponent extends DataroomElement {
  async initialize() {
    // Component setup
  }
}

if (!customElements.get('my-component')) {
  customElements.define('my-component', MyComponent);
}
```

Rules:
- Element names MUST contain a hyphen
- NEVER use Shadow DOM
- NEVER embed CSS in JavaScript
- Create CSS in `styles/<component-name>.css` and import in `index.css`

### Web Workers

Always use this exact syntax:

```javascript
const worker = new Worker(new URL('./my-worker.js', import.meta.url));
```

Never use string paths: `new Worker('./my-worker.js')` — bundlers cannot trace them.

### WebAssembly

#### C++ (Emscripten)

- Place source in `src/wasm/cpp/<name>.cpp`
- Use `EMSCRIPTEN_KEEPALIVE` on exported functions
- Build with `npm run build:wasm:cpp`
- Load glue module with dynamic `import()`
- Use `cwrap()` to create typed JS functions

#### Rust (wasm-pack)

- Place crate in `src/wasm/rust/<crate-name>/`
- Use `#[wasm_bindgen]` on exported functions
- Build with `npm run build:wasm:rust`
- Load pkg module with dynamic `import()`
- Call `await module.default()` before using exports

<!-- <TESTING-ANY> -->
### Testing

**Directive:** Write and run tests for every feature you add or change. Use each suite below for its stated purpose, keep all of them green, and add a matching test whenever you introduce new behavior.

<!-- <TESTING-E2E> -->
#### E2E Tests (Playwright)

- Use `@playwright/test` for all E2E tests
- Place tests in `tests/e2e/*.spec.js`
- Run with `npm test`; debug with `npm run test:ui`; verify the production build with `npm run test:prod`
- Use `page.locator()` for element selection
- Use `page.evaluate()` for testing custom events
- Use 15-second timeouts for wasm-dependent assertions
- Every user-facing feature MUST have an E2E test; run the suite before considering any change complete
<!-- </TESTING-E2E> -->

<!-- <TESTING-BEHAVIORAL> -->
#### Behavioral Tests (BDD-style, Playwright)

- Place tests in `tests/behavioral/*.feature.spec.js`
- Run with `npm test` (they execute alongside the E2E suite)
- Structure every scenario with explicit Given / When / Then steps via `test.step()` — see `tests/behavioral/counter.feature.spec.js`
- Describe behavior from the user's point of view; assert only on what the user can observe, never on internal state
- Write the scenario first, then implement until it passes
<!-- </TESTING-BEHAVIORAL> -->

<!-- <TESTING-UNIT> -->
#### Unit Tests (Vitest)

- Use `vitest`; place tests in `tests/unit/*.test.js`
- Run with `npm run test:unit`
- Unit tests target pure logic only — no DOM, no dev server. Extract logic from components into `src/*-logic.js` modules (see `src/counter-logic.js`) and test those
- Assert exact values, not just definedness — weak assertions produce surviving mutants
- New logic MUST ship with unit tests in the same change
<!-- </TESTING-UNIT> -->

<!-- <TESTING-MUTATION> -->
#### Mutation Tests (Stryker)

- Run with `npm run test:mutation`
- Stryker mutates the files listed in `stryker.config.js` (`mutate` array) and reruns the Vitest unit suite for each mutant
- Only add a file to `mutate` once it has real unit test coverage
- Investigate every surviving mutant: either strengthen the unit test to kill it or document why it is equivalent
- Keep the mutation score above the `break` threshold in `stryker.config.js`
<!-- </TESTING-MUTATION> -->
<!-- </TESTING-ANY> -->

### State Management

- Use component instance properties (`this.propertyName`)
- Emit custom events for cross-component communication via `this.event('name', detail)`
- Listen to events via `this.on('name', callback)` or `this.once('name', callback)`

### HTTP Requests

- Use `this.getJSON(url)` for simple GET requests to JSON endpoints
- Use `this.call(endpoint, body)` for POST requests with auth/timeout support
- Always wrap in `try/catch` for error handling

## File Organization

| Directory | Purpose |
|-----------|---------|
| `src/` | JavaScript modules and components |
| `src/wasm/` | WebAssembly source files and binaries |
| `styles/` | CSS files (one per component or concern) |
<!-- <TESTING-ANY> -->
| `tests/` | Test files (see Testing section) |
<!-- </TESTING-ANY> -->
| `scripts/` | Build-time transformation scripts |
| `assets/` | Static files (images, fonts, etc.) |

## Prohibited Patterns

- ❌ TypeScript
- ❌ React/Vue/Angular/Svelte
- ❌ Shadow DOM
- ❌ CSS-in-JS (styled-components, emotion, etc.)
- ❌ Inline styles in JavaScript
- ❌ Framework-specific state managers (Redux, Pinia, etc.)
- ❌ jQuery or similar DOM wrappers
- ❌ `new Worker('./relative-path.js')` (use `new URL(..., import.meta.url)`)
