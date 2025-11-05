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
 * Creates a readline interface for user input
 * 
 * @returns {readline.Interface} The readline interface
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompts the user with a question and returns their answer
 * 
 * @param {readline.Interface} rl - The readline interface
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Optional default value
 * @returns {Promise<string>} The user's answer
 */
function ask(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue 
      ? `${question} (${defaultValue}): `
      : `${question}: `;
    
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Collects project configuration from user input
 * 
 * @param {string} projectName - The project name
 * @returns {Promise<object>} Configuration object with all project details
 */
async function collectProjectInfo(projectName) {
  const rl = createReadlineInterface();
  
  const logo = ".-. .-. .-. . . .-. .-. .-.   . .-.\r\n|-\' | | |   |-| |-| |  )|-    | `-.\r\n\'   `-\' `-\' \' ` ` \' `-\' `-\' `-\' `-\'\r\n       Write JS with Passion\r\n             By LNSY\r\n"
  console.log(logo);


  console.log('\n📝 Let\'s set up your Pochade-JS project!\n');
  
  const config = {
    project_name: projectName,
    project_title: await ask(rl, 'Project title', projectName),
    project_description: await ask(rl, 'Project description', 'A vanilla JS, CSS and HTML project'),
    project_url: await ask(rl, 'Project URL (where it will be hosted)', ''),
    project_image_url: await ask(rl, 'Project image URL (for social sharing)', ''),
    project_alt_text: await ask(rl, 'Project image alt text', ''),
    project_sitename: await ask(rl, 'Project site name', projectName),
    author_name: await ask(rl, 'Author name', ''),
    author_email: await ask(rl, 'Author email', ''),
    github_username: await ask(rl, 'GitHub username', ''),
    license: await ask(rl, 'License', 'Unlicense')
  };
  
  rl.close();
  
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
  console.log('\n💡 We suggest that you begin by typing:');
  console.log(`\n  cd ${projectName}`);
  console.log('  npm start');
  console.log('\n🎨 Happy coding!');
}

createProject();
