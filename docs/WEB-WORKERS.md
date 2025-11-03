# Web Worker Integration

This project uses an embedded web worker pattern that allows web workers to be bundled directly into the main JavaScript file. This approach eliminates the need for separate worker files and makes the code work seamlessly with CDN services like unpkg.com.

## How It Works

### 1. Worker File Naming Convention

Web worker files should follow one of these naming patterns:
- `*.worker.js` (e.g., `my-task.worker.js`)
- `*-webworker.js` (e.g., `example-webworker.js`)
- `*webworker.js` (e.g., `mywebworker.js`)

These files are automatically detected and transformed during the build process.

### 2. Build-Time Transformation

During the build process, a script (`scripts/transform-workers.js`) automatically:
1. Finds all worker files in the `src/` directory
2. Locates any code that creates workers using `new Worker(new URL(...))`
3. Reads the worker file contents
4. Embeds the worker code as a string with Blob/Object URL pattern
5. After the build completes, restores the original source files

This happens automatically via npm build hooks:
- `prebuild`: Transforms worker imports
- `build`: Runs rspack
- `postbuild`: Restores original source files

### 3. Creating Workers

Simply use the standard Web Worker pattern with `new URL()` and `import.meta.url`:

```javascript
const worker = new Worker(new URL('./my-task.worker.js', import.meta.url));

worker.onmessage = (event) => {
  console.log('Received:', event.data);
};

worker.postMessage({ data: 'hello' });
```

During the build process, this will automatically be transformed to:

```javascript
const worker = (function() {
  const __workerCode = `[your worker code here]`;
  const blob = new Blob([__workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
})();
```

## Writing Worker Code

Worker files should contain standard Web Worker code:

```javascript
/**
 * My Task Worker
 * 
 * Description of what this worker does
 * 
 * @event message - Listens for messages from the main thread
 */

/**
 * Handle incoming messages
 * 
 * @param {MessageEvent} event - The message event
 * @returns {void}
 */
self.onmessage = (event) => {
  const result = processData(event.data);
  self.postMessage(result);
};

function processData(data) {
  // Your worker logic here
  return data;
}
```

## Benefits

### CDN Compatibility
The entire application, including worker code, is bundled into a single file. This means you can deploy to npm and use it via unpkg.com:

```html
<script type="module" src="https://unpkg.com/pochade-js@latest/dist/main.min.js"></script>
```

### No External Dependencies
Workers are embedded as strings, so there's no need for:
- Separate worker files
- Special server configuration
- CORS workarounds
- Build-time file copying

### Version Control
Workers and main code are always in sync since they're bundled together.

## Example

See `src/example-component.js` and `src/example-webworker.js` for a complete working example.

## Technical Details

### The Blob Pattern

The embedded worker pattern works by:

1. Importing the worker code as a string
2. Creating a Blob object with the string content
3. Generating an Object URL from the Blob
4. Creating a Worker using the Object URL
5. Cleaning up the Object URL after the worker is created

This pattern is supported in all modern browsers and works exactly like loading a worker from a separate file.

### Performance

There is no performance penalty compared to separate worker files:
- Workers are created on-demand
- The Blob/URL creation is extremely fast
- Object URLs are cleaned up automatically
- No network requests are needed after the main bundle loads

## Build Process

The build process works in three stages:

1. **Prebuild** (`npm run prebuild`): Runs `scripts/transform-workers.js` to embed worker code
2. **Build** (`npm run build`): Runs rspack to bundle the application
3. **Postbuild** (`npm run postbuild`): Restores original source files using `git checkout`

You can run these individually if needed:

```bash
# Transform workers only
npm run prebuild

# Full build process
npm run build
```

## Troubleshooting

### Worker not found
Make sure your worker file name ends with `.worker.js`, `-webworker.js`, or `webworker.js`.

### Transformation not happening
Ensure you're using the standard pattern: `new Worker(new URL('./file.worker.js', import.meta.url))`

### Build errors
Ensure worker files contain valid JavaScript that can run in a Worker context (no DOM access, etc.).

### Source files modified after build
The postbuild script should restore your files automatically. If not, manually run `git checkout -- src/`
