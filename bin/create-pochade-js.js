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

/**
 * Main function to create a new Pochade-JS project
 * 
 * @returns {void}
 */
function createProject() {
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

  console.log(`Creating a new Pochade-JS project in ${projectDir}...`);

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

  // Update package.json with the new project name
  const packageJsonPath = path.join(projectDir, 'package.json');
  const projectPackageJson = require(packageJsonPath);
  projectPackageJson.name = projectName;
  projectPackageJson.version = '1.0.0';
  
  // Remove bin field from the generated project
  delete projectPackageJson.bin;
  
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(projectPackageJson, null, 2)
  );

  console.log('\nInstalling dependencies...');
  
  // Run `npm install` in the project directory
  const installResult = spawn.sync('npm', ['install'], {
    cwd: projectDir,
    stdio: 'inherit'
  });

  if (installResult.status !== 0) {
    console.error('\nError: npm install failed.');
    process.exit(1);
  }

  console.log('\n✨ Success! Your new Pochade-JS project is ready.');
  console.log(`\nCreated ${projectName} at ${projectDir}`);
  console.log('\nInside that directory, you can run several commands:');
  console.log('\n  npm start');
  console.log('    Starts the development server.');
  console.log('\n  npm run build');
  console.log('    Builds the app for production.');
  console.log('\nWe suggest that you begin by typing:');
  console.log(`\n  cd ${projectName}`);
  console.log('  npm start');
  console.log('\nHappy coding! 🎨');
}

createProject();
