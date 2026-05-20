/**
 * Main Entry Point
 *
 * This is the primary JavaScript entry point for the webpack build.
 * It imports the global CSS and all custom element modules.
 *
 * Webpack follows this dependency graph to bundle everything into
 * a single output file (or split chunks if configured).
 *
 * For LLMs: When adding a new component:
 *   1. Create the component file in src/
 *   2. Add an import statement below
 *   3. If the component needs styles, create a CSS file in styles/
 *   4. Import the CSS in index.css (not here — keep JS and CSS separate)
 */

// Global styles: imported first so they are available before components render
import './index.css';

// ============================================================================
// Core Examples
// ============================================================================

// The original example component: demonstrates dataroom-js basics and web workers
import './src/example-component.js';

// ============================================================================
// Interactive Examples
// ============================================================================

// Counter: demonstrates state management and event emission in custom elements
import './src/counter-component.js';

// Fetch API: demonstrates getJSON() and network error handling
import './src/fetch-example-component.js';

// ============================================================================
// WebAssembly Examples
// ============================================================================

// C++ WebAssembly: demonstrates loading an Emscripten-compiled wasm module
import './src/wasm-cpp-component.js';

// Rust WebAssembly: demonstrates loading a wasm-pack compiled module
import './src/wasm-rust-component.js';

// ============================================================================
// Application Bootstrap
// ============================================================================

/**
 * Optional: Add any global application initialization here.
 *
 * For example, you might set up a service worker, initialize analytics,
 * or configure global error handlers. Since this is a starter template,
 * we keep it minimal.
 */
console.log('Pochade-JS application initialized');
