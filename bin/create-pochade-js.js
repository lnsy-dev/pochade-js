#!/usr/bin/env node

/**
 * create-pochade-js
 * 
 * Creates a new Pochade-JS project from the template.
 * 
 * Usage: npx create-pochade-js my-app
 * 
 * @module create-pochade-js
 */

const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Creates a line reader that queues lines from stdin.
 * This avoids losing buffered lines when reading sequentially,
 * which can happen with readline.question() on piped input.
 * 
 * @returns {{nextLine: () => Promise<string|undefined>, close: () => void}}
 */
function createLineReader() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines = [];
  let resolveNext = null;
  let closed = false;

  rl.on('line', (line) => {
    if (resolveNext) {
      resolveNext(line);
      resolveNext = null;
    } else {
      lines.push(line);
    }
  });

  rl.on('close', () => {
    closed = true;
    if (resolveNext) resolveNext(undefined);
  });

  return {
    async nextLine() {
      if (lines.length > 0) {
        return lines.shift();
      }
      if (closed) return undefined;
      return new Promise((resolve) => { resolveNext = resolve; });
    },
    close() { rl.close(); }
  };
}

/**
 * Prompts the user with a question and returns their answer
 * 
 * @param {object} reader - The line reader
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Optional default value
 * @returns {Promise<string>} The user's answer
 */
async function ask(reader, question, defaultValue = '') {
  const prompt = defaultValue 
    ? `${question} (${defaultValue}): `
    : `${question}: `;
  process.stdout.write(prompt);
  const answer = await reader.nextLine();
  return (answer ?? '').trim() || defaultValue;
}

/**
 * Prompts the user to choose from a numbered list of options
 * 
 * @param {object} reader - The line reader
 * @param {string} question - The question to ask
 * @param {Array<{label: string, value: string}>} options - Available options
 * @param {string} defaultValue - Default value if user presses enter
 * @returns {Promise<string>} The selected option value
 */
async function askChoice(reader, question, options, defaultValue) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    const marker = opt.value === defaultValue ? ' [default]' : '';
    console.log(`  ${i + 1}. ${opt.label}${marker}`);
  });
  const defaultIndex = options.findIndex(o => o.value === defaultValue);
  const prompt = `Enter choice (1-${options.length}) [${defaultIndex + 1}]: `;
  process.stdout.write(prompt);
  
  const answer = await reader.nextLine();
  const trimmed = (answer ?? '').trim();
  if (!trimmed) {
    return defaultValue;
  }
  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num) || num < 1 || num > options.length) {
    console.log(`Invalid choice. Using default (${defaultIndex + 1}).`);
    return defaultValue;
  }
  return options[num - 1].value;
}

/**
 * Prompts the user to select multiple options from a numbered list
 * (checkbox-style selection via comma-separated numbers)
 *
 * @param {object} reader - The line reader
 * @param {string} question - The question to ask
 * @param {Array<{label: string, value: string}>} options - Available options
 * @returns {Promise<string[]>} The selected option values
 */
async function askMultiChoice(reader, question, options) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt.label}`);
  });
  process.stdout.write(`Enter choices (e.g. 1,3), 'all', or 'none' [all]: `);

  const answer = await reader.nextLine();
  const trimmed = (answer ?? '').trim().toLowerCase();

  if (!trimmed || trimmed === 'all') {
    return options.map(o => o.value);
  }
  if (trimmed === 'none') {
    return [];
  }

  const values = [];
  const invalid = [];
  trimmed.split(/[\s,]+/).forEach((token) => {
    const num = parseInt(token, 10);
    if (Number.isNaN(num) || num < 1 || num > options.length) {
      invalid.push(token);
      return;
    }
    const value = options[num - 1].value;
    if (!values.includes(value)) {
      values.push(value);
    }
  });

  if (invalid.length > 0) {
    console.log(`Ignoring invalid choice(s): ${invalid.join(', ')}`);
  }
  if (values.length === 0) {
    console.log('No valid choices. Using default (all).');
    return options.map(o => o.value);
  }
  return values;
}

/**
 * Collects project configuration from user input
 * 
 * @param {string} projectName - The project name
 * @returns {Promise<object>} Configuration object with all project details
 */
async function collectProjectInfo(projectName) {
  const reader = createLineReader();
  
  const logo = ".-. .-. .-. . . .-. .-. .-.   . .-.\r\n|-' | | |   |-| |-| |  )|-    | `-.\r\n'   `-' `-' ' ` ` ' `-' `-' `-' `-'\r\n       Write JS with Passion\r\n             By LNSY\r\n"
  console.log(logo);


  console.log('\n📝 Let\'s set up your Pochade-JS project!\n');
  
  const wasmOptions = [
    { label: 'None', value: 'none' },
    { label: 'C++ (Emscripten)', value: 'cpp' },
    { label: 'Rust (wasm-pack)', value: 'rust' },
    { label: 'Both C++ and Rust', value: 'both' }
  ];
  
  const wasmChoice = await askChoice(reader, 'Include WebAssembly support?', wasmOptions, 'none');

  const testOptions = [
    { label: 'End-to-end tests (Playwright)', value: 'e2e' },
    { label: 'Behavioral tests (BDD-style, Playwright)', value: 'behavioral' },
    { label: 'Unit tests (Vitest)', value: 'unit' },
    { label: 'Mutation tests (Stryker — runs the unit test suite)', value: 'mutation' }
  ];

  const testTypes = await askMultiChoice(reader, 'Which test suites should be included?', testOptions);
  
  const config = {
    project_name: projectName,
    project_title: await ask(reader, 'Project title', projectName),
    project_description: await ask(reader, 'Project description', 'A vanilla JS, CSS and HTML project'),
    project_url: await ask(reader, 'Project URL (where it will be hosted)', ''),
    project_image_url: await ask(reader, 'Project image URL (for social sharing)', ''),
    project_alt_text: await ask(reader, 'Project image alt text', ''),
    project_sitename: await ask(reader, 'Project site name', projectName),
    author_name: await ask(reader, 'Author name', ''),
    author_email: await ask(reader, 'Author email', ''),
    github_username: await ask(reader, 'GitHub username', ''),
    license: await ask(reader, 'License', 'Unlicense'),
    wasm_choice: wasmChoice,
    test_types: testTypes
  };
  
  reader.close();
  
  return config;
}

/**
 * Replaces template variables in a string with actual values
 * 
 * @param {string} content - The content with template variables
 * @param {object} config - Configuration object with values
 * @returns {string} Content with variables replaced
 */
function replaceTemplateVariables(content, config) {
  return content
    .replace(/\$\{project_title\}/g, config.project_title)
    .replace(/\$\{project_description\}/g, config.project_description)
    .replace(/\$\{project_url\}/g, config.project_url)
    .replace(/\$\{project_image_url\}/g, config.project_image_url)
    .replace(/\$\{project_alt_text\}/g, config.project_alt_text)
    .replace(/\$\{project_sitename\}/g, config.project_sitename);
}

/**
 * Updates the index.html file with project-specific values
 * 
 * @param {string} projectDir - The project directory path
 * @param {object} config - Configuration object
 * @returns {void}
 */
function updateIndexHtml(projectDir, config) {
  const indexPath = path.join(projectDir, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf-8');
  content = replaceTemplateVariables(content, config);
  fs.writeFileSync(indexPath, content, 'utf-8');
}

/**
 * Removes blocks delimited by start and end markers from content
 * 
 * @param {string} content - The file content
 * @param {string} startMarker - The start marker
 * @param {string} endMarker - The end marker
 * @returns {string} Content with the marked blocks removed
 */
function removeMarkedBlocks(content, startMarker, endMarker) {
  const regex = new RegExp(
    startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '[\\s\\S]*?' +
    endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'g'
  );
  return content.replace(regex, '');
}

/**
 * Recursively removes a directory and all its contents
 * 
 * @param {string} dirPath - The directory path to remove
 * @returns {void}
 */
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Configures WebAssembly support in the generated project based on user choice
 * 
 * @param {string} projectDir - The project directory path
 * @param {object} config - Configuration object
 * @returns {void}
 */
function configureWasmSupport(projectDir, config) {
  const choice = config.wasm_choice;
  
  const includeCpp = choice === 'cpp' || choice === 'both';
  const includeRust = choice === 'rust' || choice === 'both';
  
  // Delete unwanted WASM source files and tests
  if (!includeCpp) {
    removeDir(path.join(projectDir, 'src', 'wasm', 'cpp'));
    const cppComponent = path.join(projectDir, 'src', 'wasm-cpp-component.js');
    const cppTest = path.join(projectDir, 'tests', 'e2e', 'wasm-cpp-component.spec.js');
    if (fs.existsSync(cppComponent)) fs.unlinkSync(cppComponent);
    if (fs.existsSync(cppTest)) fs.unlinkSync(cppTest);
  }
  
  if (!includeRust) {
    removeDir(path.join(projectDir, 'src', 'wasm', 'rust'));
    const rustComponent = path.join(projectDir, 'src', 'wasm-rust-component.js');
    const rustTest = path.join(projectDir, 'tests', 'e2e', 'wasm-rust-component.spec.js');
    if (fs.existsSync(rustComponent)) fs.unlinkSync(rustComponent);
    if (fs.existsSync(rustTest)) fs.unlinkSync(rustTest);
  }
  
  // Remove empty wasm directory if nothing is left
  if (choice === 'none') {
    const wasmDir = path.join(projectDir, 'src', 'wasm');
    if (fs.existsSync(wasmDir)) {
      const remaining = fs.readdirSync(wasmDir);
      if (remaining.length === 0) {
        fs.rmdirSync(wasmDir);
      }
    }
  }
  
  // Strip marker blocks from index.js
  const indexJsPath = path.join(projectDir, 'index.js');
  if (fs.existsSync(indexJsPath)) {
    let indexJs = fs.readFileSync(indexJsPath, 'utf-8');
    if (!includeCpp) {
      indexJs = removeMarkedBlocks(indexJs, '// <WASM-CPP>', '// </WASM-CPP>');
    }
    if (!includeRust) {
      indexJs = removeMarkedBlocks(indexJs, '// <WASM-RUST>', '// </WASM-RUST>');
    }
    fs.writeFileSync(indexJsPath, indexJs, 'utf-8');
  }
  
  // Strip marker blocks from index.html
  const indexHtmlPath = path.join(projectDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    if (!includeCpp) {
      indexHtml = removeMarkedBlocks(indexHtml, '<!-- <WASM-CPP> -->', '<!-- </WASM-CPP> -->');
    }
    if (!includeRust) {
      indexHtml = removeMarkedBlocks(indexHtml, '<!-- <WASM-RUST> -->', '<!-- </WASM-RUST> -->');
    }
    if (choice === 'none') {
      indexHtml = removeMarkedBlocks(indexHtml, '<!-- <WASM-SECTION> -->', '<!-- </WASM-SECTION> -->');
    }
    fs.writeFileSync(indexHtmlPath, indexHtml, 'utf-8');
  }
  
  // Strip marker blocks from index.css and remove unused stylesheet
  const indexCssPath = path.join(projectDir, 'index.css');
  if (fs.existsSync(indexCssPath)) {
    let indexCss = fs.readFileSync(indexCssPath, 'utf-8');
    if (choice === 'none') {
      indexCss = removeMarkedBlocks(indexCss, '/* <WASM> */', '/* </WASM> */');
      const wasmCss = path.join(projectDir, 'styles', 'wasm-components.css');
      if (fs.existsSync(wasmCss)) fs.unlinkSync(wasmCss);
    }
    fs.writeFileSync(indexCssPath, indexCss, 'utf-8');
  }
  
  // Update package.json
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (!includeCpp && pkg.scripts && pkg.scripts['build:wasm:cpp']) {
      delete pkg.scripts['build:wasm:cpp'];
    }
    if (!includeRust && pkg.scripts && pkg.scripts['build:wasm:rust']) {
      delete pkg.scripts['build:wasm:rust'];
    }
    
    if (choice === 'none' && Array.isArray(pkg.keywords)) {
      pkg.keywords = pkg.keywords.filter(k => k !== 'webassembly');
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  }
}


/**
 * Configures the test suites in the generated project based on user selection
 *
 * Removes test files, configs, dependencies, scripts, and documentation
 * blocks for every test type the user did not select.
 *
 * @param {string} projectDir - The project directory path
 * @param {object} config - Configuration object
 * @returns {void}
 */
function configureTestSupport(projectDir, config) {
  const selected = Array.isArray(config.test_types) ? [...config.test_types] : [];

  // Mutation testing drives the unit test suite, so it cannot stand alone
  if (selected.includes('mutation') && !selected.includes('unit')) {
    console.log('\nℹ️  Mutation tests run against the unit test suite — including unit tests too.');
    selected.push('unit');
  }

  const includeE2e = selected.includes('e2e');
  const includeBehavioral = selected.includes('behavioral');
  const includeUnit = selected.includes('unit');
  const includeMutation = selected.includes('mutation');
  const includePlaywright = includeE2e || includeBehavioral;
  const includeAnyTests = includePlaywright || includeUnit || includeMutation;

  // Delete test files for suites that were not selected
  if (!includeE2e) removeDir(path.join(projectDir, 'tests', 'e2e'));
  if (!includeBehavioral) removeDir(path.join(projectDir, 'tests', 'behavioral'));
  if (!includeUnit) removeDir(path.join(projectDir, 'tests', 'unit'));

  // Delete config files for suites that were not selected
  const configFiles = [
    { keep: includePlaywright, file: 'playwright.config.js' },
    { keep: includeUnit, file: 'vitest.config.js' },
    { keep: includeMutation, file: 'stryker.config.js' }
  ];
  configFiles.forEach(({ keep, file }) => {
    if (!keep) {
      const filePath = path.join(projectDir, file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  // Remove the tests directory entirely when no suite was selected
  if (!includeAnyTests) {
    removeDir(path.join(projectDir, 'tests'));
  }

  // Strip marker blocks for unselected suites from the docs
  const docFiles = ['AGENTS.md', 'README.md'];
  docFiles.forEach((file) => {
    const filePath = path.join(projectDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!includeE2e) {
      content = removeMarkedBlocks(content, '<!-- <TESTING-E2E> -->', '<!-- </TESTING-E2E> -->');
    }
    if (!includeBehavioral) {
      content = removeMarkedBlocks(content, '<!-- <TESTING-BEHAVIORAL> -->', '<!-- </TESTING-BEHAVIORAL> -->');
    }
    if (!includeUnit) {
      content = removeMarkedBlocks(content, '<!-- <TESTING-UNIT> -->', '<!-- </TESTING-UNIT> -->');
    }
    if (!includeMutation) {
      content = removeMarkedBlocks(content, '<!-- <TESTING-MUTATION> -->', '<!-- </TESTING-MUTATION> -->');
    }
    if (!includePlaywright) {
      content = removeMarkedBlocks(content, '<!-- <TESTING-PLAYWRIGHT> -->', '<!-- </TESTING-PLAYWRIGHT> -->');
    }
    if (!includeAnyTests) {
      content = removeMarkedBlocks(content, '<!-- <TESTING-ANY> -->', '<!-- </TESTING-ANY> -->');
    }
    fs.writeFileSync(filePath, content, 'utf-8');
  });

  // Update package.json scripts and devDependencies
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (pkg.devDependencies) {
      if (!includePlaywright) delete pkg.devDependencies['@playwright/test'];
      if (!includeUnit) delete pkg.devDependencies['vitest'];
      if (!includeMutation) {
        delete pkg.devDependencies['@stryker-mutator/core'];
        delete pkg.devDependencies['@stryker-mutator/vitest-runner'];
      }
    }

    if (pkg.scripts) {
      if (!includePlaywright) {
        delete pkg.scripts['test:ui'];
        delete pkg.scripts['test:prod'];
      }
      if (!includeUnit) delete pkg.scripts['test:unit'];
      if (!includeMutation) delete pkg.scripts['test:mutation'];

      // Keep `npm test` pointing at whichever suites remain
      if (includePlaywright) {
        pkg.scripts.test = 'playwright test';
      } else if (includeUnit) {
        pkg.scripts.test = 'vitest run';
      } else {
        delete pkg.scripts.test;
      }
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  }
}


/**
 * Main function to create a new Pochade-JS project
 * 
 * @returns {Promise<void>}
 */
async function createProject() {
  // The first argument will be the project name.
  const projectName = process.argv[2];

  // Validate project name
  if (!projectName) {
    console.error('Error: Please specify the project name.');
    console.log('Usage: npx create-pochade-js <project-name>');
    process.exit(1);
  }

  // Create a project directory with the project name.
  const currentDir = process.cwd();
  const projectDir = path.resolve(currentDir, projectName);

  // Check if directory already exists
  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  // Collect project information from user
  const config = await collectProjectInfo(projectName);

  console.log(`\n🚀 Creating a new Pochade-JS project in ${projectDir}...`);

  // Create the project directory
  fs.mkdirSync(projectDir, { recursive: true });

  // Copy template files
  const templateDir = path.resolve(__dirname, '..', 'template');
  
  if (!fs.existsSync(templateDir)) {
    console.error('Error: Template directory not found.');
    process.exit(1);
  }

  fs.cpSync(templateDir, projectDir, { recursive: true });

  // Rename dotfiles (stored without dots in template)
  const dotfiles = [
    { from: 'gitignore', to: '.gitignore' },
    { from: 'npmignore', to: '.npmignore' },
    { from: 'envexample', to: '.env.example' }
  ];

  dotfiles.forEach(({ from, to }) => {
    const fromPath = path.join(projectDir, from);
    const toPath = path.join(projectDir, to);
    if (fs.existsSync(fromPath)) {
      fs.renameSync(fromPath, toPath);
    }
  });

  // Update index.html with project-specific values
  updateIndexHtml(projectDir, config);

  // Configure WASM support based on user choice
  configureWasmSupport(projectDir, config);

  // Configure test suites based on user selection
  configureTestSupport(projectDir, config);

  // Update package.json with the new project information
  const packageJsonPath = path.join(projectDir, 'package.json');
  const projectPackageJson = require(packageJsonPath);
  projectPackageJson.name = config.project_name;
  projectPackageJson.version = '1.0.0';
  projectPackageJson.description = config.project_description;
  projectPackageJson.license = config.license;
  
  // Update author information
  if (config.author_name || config.author_email) {
    const authorString = config.author_email 
      ? `${config.author_name} <${config.author_email}>`
      : config.author_name;
    projectPackageJson.author = authorString;
  }
  
  // Update repository information
  if (config.github_username) {
    const repoUrl = `https://github.com/${config.github_username}/${config.project_name}.git`;
    projectPackageJson.repository = {
      type: 'git',
      url: repoUrl
    };
    projectPackageJson.bugs = {
      url: `https://github.com/${config.github_username}/${config.project_name}/issues`
    };
    projectPackageJson.homepage = `https://github.com/${config.github_username}/${config.project_name}#readme`;
  }
  
  // Remove bin field from the generated project
  delete projectPackageJson.bin;
  
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(projectPackageJson, null, 2)
  );

  console.log('\n📦 Installing dependencies...');
  
  // Run `npm install` in the project directory
  const installResult = spawn.sync('npm', ['install'], {
    cwd: projectDir,
    stdio: 'inherit'
  });

  if (installResult.status !== 0) {
    console.error('\n❌ Error: npm install failed.');
    process.exit(1);
  }

  console.log('\n✨ Success! Your new Pochade-JS project is ready.');
  console.log(`\n📁 Created ${projectName} at ${projectDir}`);
  console.log('\n📚 Inside that directory, you can run several commands:');
  console.log('\n  npm start');
  console.log('    Starts the development server.');
  console.log('\n  npm run build');
  console.log('    Builds the app for production.');
  if (config.test_types && config.test_types.length > 0) {
    console.log('\n  npm test');
    console.log('    Runs the test suites you selected.');
  }
  console.log('\n💡 We suggest that you begin by typing:');
  console.log(`\n  cd ${projectName}`);
  console.log('  npm start');
  console.log('\n🎨 Happy coding!');
}

createProject();
