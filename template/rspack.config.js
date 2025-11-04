/**
 * Rspack Configuration
 * 
 * Build configuration for a vanilla JS project using Rspack bundler.
 * Handles module bundling, CSS processing, web workers, and development server setup.
 */

import dotenv from 'dotenv';
dotenv.config();

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import rspack from '@rspack/core';

/**
 * Module directory path resolution for ES modules
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Environment flag for production builds
 */
const isProd = process.env.NODE_ENV === 'production';

/**
 * Check if a directory exists and has files
 * 
 * @param {string} dirPath - Path to the directory to check
 * @returns {boolean} True if directory exists and contains files
 */
const hasFiles = (dirPath) => {
  if (!existsSync(dirPath)) return false;
  try {
    const files = readdirSync(dirPath);
    return files.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Rspack configuration object
 * 
 * @type {Object}
 * @property {string} entry - Entry point for the application bundle
 * @property {string} mode - Build mode (production or development)
 * @property {boolean|string} devtool - Source map generation strategy
 * @property {Object} output - Output file configuration
 * @property {Object} optimization - Bundle optimization settings
 * @property {Object} devServer - Development server configuration
 * @property {Object} module - Module processing rules
 * @property {Object} resolve - Module resolution configuration
 * @property {Array} plugins - Rspack plugins
 */
export default {
  entry: './index.js',
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'source-map',
  output: {
    filename: process.env.OUTPUT_FILE_NAME || 'main.min.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  /**
   * Development server configuration
   * 
   * Serves static files from project root and conditionally from assets directory.
   * Enables compression and disables caching for development.
   */
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
      // Only serve assets directory if it exists and has files
      ...(hasFiles(path.join(__dirname, 'assets'))
        ? [
            {
              directory: path.join(__dirname, 'assets'),
              publicPath: '/',
            },
          ]
        : []),
    ],
    compress: true,
    port: process.env.PORT || 3000,
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  /**
   * Module processing rules
   * 
   * Defines loaders for CSS and JavaScript files.
   * CSS: style-loader -> css-loader -> postcss-loader (with cssnano)
   * JS: swc-loader -> custom transform-workers loader
   */
  module: {
    rules: [
      /**
       * CSS processing rule
       * 
       * Processes CSS files with style injection, module resolution, and minification.
       */
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: !isProd,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['cssnano', { preset: ['default', { discardComments: { removeAll: true } }] }],
                ],
              },
            },
          },
        ],
      },
      /**
       * JavaScript processing rule
       * 
       * Transpiles JS with SWC and applies custom worker transformations.
       * Forces eager evaluation of dynamic imports for web worker compatibility.
       */
      {
        test: /\.js$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'ecmascript',
                },
              },
            },
          },
          {
            loader: path.resolve(__dirname, 'scripts/transform-workers.js'),
          },
        ],
        parser: {
          javascript: {
            dynamicImportMode: 'eager',
          },
        },
      },
    ],
  },
  /**
   * Module resolution configuration
   * 
   * Specifies directories to search when resolving modules.
   */
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  /**
   * Rspack plugins
   * 
   * CopyRspackPlugin: Copies static files to the dist directory.
   * Conditionally copies assets directory if it exists and contains files.
   */
  plugins: [
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'index.html',
          to: 'index.html',
        },
        // Only copy assets if the directory exists and has files
        ...(hasFiles(path.join(__dirname, 'assets'))
          ? [
              {
                from: 'assets',
                to: '.',
                noErrorOnMissing: true,
              },
            ]
          : []),
      ],
    }),
  ],
};
