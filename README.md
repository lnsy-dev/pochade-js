# create-pochade-js

An npx starter template for creating vanilla JS, CSS and HTML projects with Web Workers and Custom HTML Elements as first class citizens.

## Quick Start

Create a new Pochade-JS project with a single command:

```bash
npx create-pochade-js my-app
```

This will:
- Create a new directory called `my-app`
- Copy all the necessary project files
- Install all dependencies automatically
- Set up your project and make it ready to use

Then navigate to your project and start developing:

```bash
cd my-app
npm start
```

## What's Included

Your new Pochade-JS project includes:

- **Rspack** for fast bundling
- **dataroom-js** for custom HTML elements
- **Web Workers** support with automatic transformation
- **PostCSS** with cssnano for CSS optimization
- Development server with hot reload
- Production build optimization

## Available Scripts

In your new project directory, you can run:

### `npm start`

Runs the app in development mode. Open your browser to view it (default port: 3000).

### `npm run build`

Builds the app for production to the `dist` folder. It correctly bundles your app and optimizes the build for the best performance.

## Customizing the Build

You can customize the build output by creating a `.env` file in the root of your project.

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

## Publishing Your Template (For Maintainers)

To publish this template to npm:

1. Make sure you're logged into npm: `npm login`
2. Publish the package: `npm publish`

Users can then use it with `npx create-pochade-js`.
