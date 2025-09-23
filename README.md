# context-engineering-boilerplate
An rspack boilerplate for generating custom html elements that are easily compiled.

I have added a few features to make utilizing the project easier. 

The `prompts/` folder is in the .gitignore file for your convenience.

## Installation

To install the project dependencies, run the following command:

```bash
npm install
```

## Running the Project

To run the project in development mode, use the following command:

```bash
npm run start
```

This will start a development server, and you can view the project in your browser.

## Building the Project

To build the project for production, use the following command:

```bash
npm run build
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

If this variable is not set, the output file will default to `main.min.js`.