#!/usr/bin/env node

/**
 * Transform Workers Build Script
 * 
 * This script finds all web worker imports in the src directory
 * and transforms them to embed the worker code as a Blob pattern.
 * 
 * This allows workers to be bundled into a single file for CDN deployment.
 * 
 * @module transform-workers
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const WORKER_PATTERN = /\.worker\.js$|-webworker\.js$|webworker\.js$/;

/**
 * Read all files in a directory recursively
 * 
 * @param {string} dir - Directory path to read
 * @returns {Promise<string[]>} Array of file paths
 */
async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getAllFiles(fullPath);
      }
      return fullPath;
    })
  );
  return files.flat();
}

/**
 * Check if a file is a worker file based on naming convention
 * 
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file is a worker file
 */
function isWorkerFile(filePath) {
  return WORKER_PATTERN.test(filePath);
}

/**
 * Transform worker imports in a file
 * 
 * Finds patterns like:
 *   new Worker(new URL('./example-webworker.js', import.meta.url))
 * 
 * And transforms them to embed the worker code with Blob pattern:
 *   (function() {
 *     const code = `[actual worker code]`;
 *     const blob = new Blob([code], { type: 'application/javascript' });
 *     const url = URL.createObjectURL(blob);
 *     const worker = new Worker(url);
 *     URL.revokeObjectURL(url);
 *     return worker;
 *   })()
 * 
 * @param {string} filePath - Path to the file to transform
 * @param {Map<string, string>} workerContents - Map of worker paths to their contents
 * @returns {Promise<boolean>} True if file was modified
 */
async function transformFile(filePath, workerContents) {
  const content = await fs.readFile(filePath, 'utf-8');
  const dir = path.dirname(filePath);
  
  // Match new Worker(new URL(...)) patterns for worker files
  const workerRegex = /new\s+Worker\(new\s+URL\(['"]([^'"]+(?:\.worker|-webworker|webworker)\.js)['"]\s*,\s*import\.meta\.url\)\)/g;
  
  let matches = [];
  let match;
  while ((match = workerRegex.exec(content)) !== null) {
    matches.push({
      full: match[0],
      workerPath: match[1]
    });
  }
  
  if (matches.length === 0) {
    return false;
  }
  
  let newContent = content;
  
  for (const { full, workerPath } of matches) {
    // Resolve the worker file path
    const resolvedPath = path.resolve(dir, workerPath);
    const workerCode = workerContents.get(resolvedPath);
    
    if (!workerCode) {
      console.warn(`Warning: Worker file not found: ${resolvedPath}`);
      continue;
    }
    
    // Escape backticks and backslashes in worker code
    const escapedCode = workerCode
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');
    
    // Generate the inline worker creation
    const inlineWorker = `(function() {
    const __workerCode = \`${escapedCode}\`;
    const blob = new Blob([__workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    return worker;
  })()`;
    
    newContent = newContent.replace(full, inlineWorker);
  }
  
  // Write the transformed file
  await fs.writeFile(filePath, newContent, 'utf-8');
  
  return true;
}

/**
 * Main transformation process
 * 
 * @returns {Promise<void>}
 */
async function main() {
  console.log('🔧 Transforming web worker imports...\n');
  
  try {
    // Get all files in src
    const allFiles = await getAllFiles(SRC_DIR);
    
    // Separate worker files and regular JS files
    const workerFiles = allFiles.filter(f => isWorkerFile(f));
    const jsFiles = allFiles.filter(f => f.endsWith('.js') && !isWorkerFile(f));
    
    console.log(`Found ${workerFiles.length} worker files:`);
    workerFiles.forEach(f => console.log(`  - ${path.relative(SRC_DIR, f)}`));
    console.log();
    
    // Read all worker file contents
    const workerContents = new Map();
    for (const workerFile of workerFiles) {
      const content = await fs.readFile(workerFile, 'utf-8');
      workerContents.set(workerFile, content);
    }
    
    // Transform each JS file
    let transformedCount = 0;
    for (const jsFile of jsFiles) {
      const wasTransformed = await transformFile(jsFile, workerContents);
      if (wasTransformed) {
        transformedCount++;
        console.log(`✓ Transformed: ${path.relative(SRC_DIR, jsFile)}`);
      }
    }
    
    console.log();
    if (transformedCount === 0) {
      console.log('ℹ️  No files needed transformation');
    } else {
      console.log(`✅ Successfully transformed ${transformedCount} file(s)`);
    }
    
  } catch (error) {
    console.error('❌ Error during transformation:', error);
    process.exit(1);
  }
}

main();
