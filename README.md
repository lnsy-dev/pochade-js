![Pochade JS Splash Image](./pochade-js-logo.jpg)

# Pochade-JS
## For Writing JS with Passion

There are some frameworks for writing careful enterprise software. This is not one of them. 

Pochade-JS is a lightweight, opinionated starter template for building vanilla JavaScript projects with modern tooling. It's designed for developers who want to write quick, passionate code without the overhead of heavy frameworks.

## What is Pochade-JS?

Pochade-JS provides a streamlined development environment for creating vanilla JS, CSS, and HTML projects with:

- **Custom HTML Elements** - Built-in support for [dataroom-js](https://github.com/DATAROOM-NETWORK/dataroom.js), making custom elements easy
- **Web Workers** - First-class support for parallel processing with automatic bundling
- **Fast Builds** - Powered by Rspack for lightning-fast development and production builds
- **Modern CSS** - PostCSS with cssnano optimization
- **Static Assets** - Automatic asset handling for images, fonts, and other static files
- **Context Engineering** - Includes LLM-friendly documentation for AI-assisted development

Perfect for static websites, interactive web apps, browser extensions, or any project where you want vanilla JavaScript with modern tooling.

---

## Quick Start

Create a new Pochade-JS project with a single command:

```sh
npx create-pochade-js my-project
```

The CLI will guide you through setup with interactive prompts:

- **Project title** - Display name for your project
- **Project description** - Brief description of what you're building
- **Project URL** - Where your project will be hosted
- **Project image URL** - Social sharing image
- **Project image alt text** - Accessibility text for the image
- **Project site name** - Name for social sharing
- **Author name** - Your name
- **Author email** - Your email address
- **GitHub username** - For repository links
- **License** - Project license (defaults to Unlicense)

After answering the prompts, Pochade-JS will:

1. Create your project directory
2. Copy all template files
3. Configure `package.json` with your information
4. Update `index.html` with your project metadata
5. Install all dependencies automatically

Then just:

```sh
cd my-project
npm start
```

Your development server will be running at `http://localhost:3000` (or your configured port).

---

## Project Structure

```
my-project/
├── assets/              # Static files (images, fonts, etc.)
├── src/                 # JavaScript source files
│   ├── example-component.js
│   └── example-webworker.js
├── styles/              # CSS files
│   └── variables.css
├── scripts/             # Build scripts
│   └── transform-workers.js
├── index.html           # Main HTML file
├── index.js             # Main JavaScript entry point
├── index.css            # Main CSS file
├── rspack.config.js     # Build configuration
├── package.json         # Project metadata and dependencies
└── .env.example         # Environment variable template
```

### Key Directories

**`assets/`** - Place any static files here (images, fonts, PDFs, etc.). These files are:
- Served from the root path (`/`) during development
- Copied to the dist root during production builds
- Accessible without any path prefix

**`src/`** - Your JavaScript modules and components. Use ES6 imports/exports freely.

**`styles/`** - CSS files organized by component or purpose. Import them in `index.css`.

**`scripts/`** - Build-time scripts, including the web worker transformer.

---

## Development

### Starting the Dev Server

```sh
npm start
```

This starts the Rspack development server with:
- Hot module replacement (HMR)
- Source maps for debugging
- Automatic recompilation on file changes
- Static file serving from `assets/`
- Default port: 3000 (configurable via `.env`)

### Building for Production

```sh
npm run build
```

Creates an optimized production build in the `dist/` directory with:
- Minified JavaScript
- Optimized and minified CSS
- Bundled web workers
- Copied static assets
- Source maps (optional)

The build output is a single JavaScript file (default: `main.min.js`) ready for deployment.

---

## Configuration

### Environment Variables

Create a `.env` file in your project root to customize the build:

```env
# Output filename for production build
OUTPUT_FILE_NAME=my-app.min.js

# Development server port
PORT=8080
```

**Available Variables:**

- `OUTPUT_FILE_NAME` - Name of the bundled JavaScript file (default: `main.min.js`)
- `PORT` - Development server port (default: `3000`)
- `NODE_ENV` - Set to `production` for production builds (automatically set by npm scripts)

### Rspack Configuration

The `rspack.config.js` file is pre-configured but fully customizable. Key features:

**Module Processing:**
- CSS: `style-loader` → `css-loader` → `postcss-loader` (with cssnano)
- JavaScript: Custom worker transformer → SWC loader
- Source maps enabled in development

**Optimization:**
- Single bundle output (no code splitting)
- No separate runtime chunk
- Automatic dist directory cleaning

**Development Server:**
- Gzip compression
- Cache-Control headers
- Static file serving
- Configurable port

---

## Working with Custom Elements

Pochade-JS uses [dataroom-js](https://github.com/DATAROOM-NETWORK/dataroom.js) for creating custom HTML elements. It provides a clean API without Shadow DOM complexity.

### Creating a Component

```javascript
import DataroomElement from 'dataroom-js';

class MyComponent extends DataroomElement {
  async initialize() {
    // Create elements
    this.create('h1', { content: 'Hello World' });
    this.create('p', { 
      content: 'This is my component',
      class: 'description'
    });
    
    // Create a button with click handler
    const button = this.create('button', { content: 'Click Me' });
    button.addEventListener('click', () => {
      this.event('button-clicked', { timestamp: Date.now() });
    });
  }
}

// Register the element
customElements.define('my-component', MyComponent);
```

### Using in HTML

```html
<my-component></my-component>
```

### Key DataroomElement Methods

**`create(type, attributes, target)`** - Create and append HTML elements
```javascript
const div = this.create('div', { class: 'container' });
this.create('p', { content: 'Nested paragraph' }, div);
```

**`event(name, detail)`** - Emit custom events
```javascript
this.event('data-loaded', { items: [...] });
```

**`on(name, callback)`** - Listen to events
```javascript
this.on('data-loaded', (detail) => {
  console.log('Data:', detail.items);
});
```

**`once(name, callback)`** - Listen to events (fires once)
```javascript
this.once('initialized', (detail) => {
  console.log('Component ready');
});
```

**`call(endpoint, body)`** - Make fetch requests with authentication
```javascript
const data = await this.call('/api/users', { method: 'GET' });
```

**`getJSON(url)`** - Fetch and parse JSON
```javascript
const config = await this.getJSON('/config.json');
```

**`log(message)`** - Conditional logging (requires `verbose` attribute)
```javascript
this.log('Debug information');
```

### Component Attributes

**`security-scheme`** - Authentication method for `call()`
- `localstorage` (default) - Sends bearer token from localStorage
- `cookie` - Uses browser cookies

**`call-timeout`** - Request timeout in milliseconds
```html
<my-component call-timeout="5000"></my-component>
```

**`verbose`** - Enable debug logging
```html
<my-component verbose="true"></my-component>
```

### Lifecycle Methods

```javascript
class MyComponent extends DataroomElement {
  async initialize() {
    // Called when component is added to DOM
    console.log('Component initialized');
  }
  
  async disconnect() {
    // Called when component is removed from DOM
    console.log('Component disconnected');
  }
}
```

### Attribute Observation

Components automatically observe attribute changes:

```javascript
class MyComponent extends DataroomElement {
  async initialize() {
    this.on('NODE-CHANGED', (detail) => {
      console.log(`${detail.attribute} changed to ${detail.newValue}`);
    });
  }
}
```

---

## Working with Web Workers

Pochade-JS has first-class support for Web Workers with automatic bundling and transformation.

### Creating a Web Worker

**`src/my-worker.js`:**
```javascript
/**
 * My Web Worker
 * Handles background processing
 */

self.onmessage = (event) => {
  const { data } = event;
  
  // Do some heavy computation
  const result = processData(data);
  
  // Send result back to main thread
  self.postMessage({ result });
};

function processData(data) {
  // Your processing logic
  return data.map(item => item * 2);
}
```

### Using a Web Worker

```javascript
import DataroomElement from 'dataroom-js';

class WorkerComponent extends DataroomElement {
  async initialize() {
    // Create worker instance
    const worker = new Worker(
      new URL('./my-worker.js', import.meta.url)
    );
    
    // Listen for messages from worker
    worker.onmessage = (event) => {
      console.log('Worker result:', event.data.result);
      this.create('p', { 
        content: `Result: ${event.data.result}` 
      });
    };
    
    // Send data to worker
    worker.postMessage([1, 2, 3, 4, 5]);
  }
}

customElements.define('worker-component', WorkerComponent);
```

### Worker Best Practices

- Use workers for CPU-intensive tasks (data processing, calculations, parsing)
- Keep worker files focused on a single responsibility
- Use structured data for messages (objects, not primitives)
- Handle errors in both main thread and worker
- Terminate workers when no longer needed: `worker.terminate()`

---

## Styling

Pochade-JS uses standard CSS without CSS-in-JS. Keep your styles organized and maintainable.

### CSS Organization

**Component-specific styles:**
```
styles/
├── variables.css       # Global variables and theme
├── my-component.css    # Component styles
└── another-component.css
```

**Import in `index.css`:**
```css
@import './styles/variables.css';
@import './styles/my-component.css';
@import './styles/another-component.css';
```

### Using CSS Variables

**`styles/variables.css`:**
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --spacing-unit: 8px;
}
```

**Component styles:**
```css
my-component {
  font-family: var(--font-family);
  padding: calc(var(--spacing-unit) * 2);
}

my-component h1 {
  color: var(--primary-color);
}
```

### No Shadow DOM

Pochade-JS components don't use Shadow DOM, so:
- Global styles apply to components
- Components can be styled from outside
- No style encapsulation issues
- Standard CSS cascade rules apply

---

## Context Engineering for AI

Pochade-JS includes documentation files optimized for AI assistants (LLMs) to help with code generation.

### Included Documentation

- **`LLM.md`** - Complete guide for AI assistants on project structure and conventions
- **`GEMINI.md`** - Gemini-specific instructions
- **`WARP.md`** - Warp AI-specific instructions

### Using with AI Assistants

When working with AI coding assistants (GitHub Copilot, Cursor, Warp AI, etc.), reference these files:

```
"Please read the LLM.md file and help me create a new component"
```

The documentation ensures AI assistants:
- Use dataroom-js correctly
- Follow project conventions (DockBlock comments, no Shadow DOM)
- Create properly structured components
- Organize CSS files correctly
- Handle web workers appropriately

---

## Publishing to npm

Your Pochade-JS project is pre-configured for npm publishing.

### Before First Publish

1. **Update `package.json`:**
   - Set unique package `name`
   - Update `author` information
   - Update `repository`, `bugs`, and `homepage` URLs
   - Set initial `version` (recommend `0.1.0`)

2. **Test the build:**
   ```sh
   npm run build
   ```

3. **Preview package contents:**
   ```sh
   npm pack --dry-run
   ```

### Publishing

```sh
# Login to npm (first time only)
npm login

# Publish the package
npm publish
```

The `prepublishOnly` script automatically runs the build before publishing.

### Updating Versions

```sh
# Bug fixes: 1.0.0 → 1.0.1
npm version patch

# New features: 1.0.0 → 1.1.0
npm version minor

# Breaking changes: 1.0.0 → 2.0.0
npm version major

# Then publish
npm publish
```

### What Gets Published

The package includes:
- `dist/` - Built production files
- `src/` - Source JavaScript files
- `styles/` - CSS files
- `index.js`, `index.css`, `index.html` - Entry files
- `package.json` and metadata

Development files (config, scripts, tests) are excluded via `.npmignore`.

---

## Examples

### Simple Counter Component

```javascript
import DataroomElement from 'dataroom-js';

class CounterComponent extends DataroomElement {
  async initialize() {
    this.count = 0;
    
    this.create('h2', { content: 'Counter' });
    this.display = this.create('p', { content: '0' });
    
    const btnInc = this.create('button', { content: '+' });
    const btnDec = this.create('button', { content: '-' });
    
    btnInc.addEventListener('click', () => this.increment());
    btnDec.addEventListener('click', () => this.decrement());
  }
  
  increment() {
    this.count++;
    this.updateDisplay();
  }
  
  decrement() {
    this.count--;
    this.updateDisplay();
  }
  
  updateDisplay() {
    this.display.textContent = this.count;
    this.event('count-changed', { count: this.count });
  }
}

customElements.define('counter-component', CounterComponent);
```

### Data Fetching Component

```javascript
import DataroomElement from 'dataroom-js';

class UserListComponent extends DataroomElement {
  async initialize() {
    this.create('h2', { content: 'Users' });
    
    try {
      const users = await this.getJSON(
        'https://jsonplaceholder.typicode.com/users'
      );
      
      const list = this.create('ul');
      users.forEach(user => {
        this.create('li', { content: user.name }, list);
      });
      
      this.event('users-loaded', { count: users.length });
    } catch (error) {
      this.create('p', { 
        content: `Error: ${error.message}`,
        class: 'error'
      });
    }
  }
}

customElements.define('user-list', UserListComponent);
```

### Worker-Powered Component

```javascript
import DataroomElement from 'dataroom-js';

class ImageProcessorComponent extends DataroomElement {
  async initialize() {
    this.create('h2', { content: 'Image Processor' });
    
    const input = this.create('input', { type: 'file' });
    const button = this.create('button', { content: 'Process' });
    
    const worker = new Worker(
      new URL('./image-worker.js', import.meta.url)
    );
    
    button.addEventListener('click', async () => {
      const file = input.files[0];
      if (!file) return;
      
      const arrayBuffer = await file.arrayBuffer();
      worker.postMessage({ image: arrayBuffer });
    });
    
    worker.onmessage = (event) => {
      this.create('p', { 
        content: `Processed in ${event.data.time}ms` 
      });
      this.event('processing-complete', event.data);
    };
  }
}

customElements.define('image-processor', ImageProcessorComponent);
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, create a `.env` file:

```env
PORT=8080
```

### Web Workers Not Working

Ensure you're using the correct import syntax:

```javascript
// ✅ Correct
const worker = new Worker(new URL('./worker.js', import.meta.url));

// ❌ Incorrect
const worker = new Worker('./worker.js');
```

### Assets Not Loading

- Check that files are in the `assets/` directory
- Verify the directory exists and contains files
- Reference assets from root: `/image.png` not `./assets/image.png`

### Custom Element Not Rendering

- Ensure you've imported the component file
- Check that `customElements.define()` is called
- Verify the element name contains a hyphen (required by spec)
- Check browser console for errors

### Build Fails

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (requires Node 16+)

---

## Requirements

- **Node.js** 16 or higher
- **npm** 7 or higher

---

## Technologies

- **[Rspack](https://www.rspack.dev/)** - Fast Rust-based bundler
- **[dataroom-js](https://github.com/DATAROOM-NETWORK/dataroom.js)** - Custom HTML elements framework
- **[SWC](https://swc.rs/)** - Fast JavaScript/TypeScript compiler
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[cssnano](https://cssnano.co/)** - CSS optimization

---

## Philosophy

Pochade-JS embraces simplicity and vanilla web technologies:

- **No framework lock-in** - Use standard Web APIs
- **No Shadow DOM** - Keep styling simple and predictable
- **No CSS-in-JS** - Separate concerns, use real CSS
- **No complex build chains** - Fast, simple Rspack configuration
- **No unnecessary abstractions** - Write JavaScript, not framework code

Perfect for developers who want modern tooling without framework overhead.

---

## License

Unlicense (Public Domain)

---

## Contributing

Issues and pull requests welcome at [github.com/lnsy-dev/pochade-js](https://github.com/lnsy-dev/pochade-js)

---

## Credits

Created by [LNSY](https://github.com/lnsy-dev)

Write JS with passion! 🎨 



