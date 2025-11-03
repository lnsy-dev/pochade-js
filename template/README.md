# Pochade-JS Project

A vanilla JS, CSS and HTML project with Web Workers and Custom HTML Elements as first class citizens.

## Getting Started

Install dependencies:

```bash
npm install
```

## Running the Project

To run the project in development mode:

```bash
npm start
```

This will start a development server. By default, it runs on port 3000. You can view the project in your browser.

## Building the Project

To build the project for production:

```bash
npm build
```

This will create a `dist` folder with the bundled and optimized files.

## Customizing the Build

You can customize the build output by creating a `.env` file in the root of the project.

### Output Filename

To change the name of the output file, set the `OUTPUT_FILE_NAME` variable in your `.env` file.

**.env**
```
OUTPUT_FILE_NAME=my-custom-filename.js
```

If this variable is not set, the output file will default to `dist/main.min.js`.

### Development Server Port

You can also change the development server port by setting the `PORT` variable in your `.env` file.

**.env**
```
PORT=8080
```

If this variable is not set, the port will default to `3000`.

## Project Structure

- `src/` - Your JavaScript source files
- `styles/` - CSS files
- `scripts/` - Build scripts (including Web Worker transformation)
- `index.html` - Main HTML file
- `index.js` - Main JavaScript entry point
- `index.css` - Main CSS file
- `rspack.config.js` - Rspack configuration

## Technologies

- **Rspack** - Fast bundler for development and production
- **dataroom-js** - Custom HTML elements framework
- **Web Workers** - For parallel processing
- **PostCSS** - CSS processing with cssnano optimization
