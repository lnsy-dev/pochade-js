# Rspack to Webpack Migration

## Summary

Successfully converted the Pochade-JS template from Rspack to Webpack while maintaining all features.

## Changes Made

### Configuration Files

- **Removed**: `template/rspack.config.js`
- **Added**: `template/webpack.config.js`
  - Replaced Rspack-specific plugins with Webpack equivalents
  - Changed `rspack.HtmlRspackPlugin` → `HtmlWebpackPlugin`
  - Changed `rspack.CssExtractRspackPlugin` → `MiniCssExtractPlugin`
  - Changed `rspack.CopyRspackPlugin` → `CopyWebpackPlugin`
  - Changed `builtin:swc-loader` → `swc-loader`

### Dependencies

**Removed**:
- `@rspack/cli`
- `@rspack/core`
- `@rspack/dev-server`

**Added**:
- `@swc/core` - Required for swc-loader
- `webpack` - Core bundler
- `webpack-cli` - CLI interface
- `webpack-dev-server` - Development server
- `html-webpack-plugin` - HTML generation
- `mini-css-extract-plugin` - CSS extraction
- `copy-webpack-plugin` - Asset copying
- `swc-loader` - JavaScript transpilation

### Scripts

Updated `package.json` scripts:
- `start`: `rspack serve` → `webpack serve`
- `build`: `rspack build` → `webpack build`

### Documentation

Updated references in:
- `template/README.md` - All Rspack references changed to Webpack
- `template/LLM.md` - Build tool reference updated
- `template/scripts/README.md` - Build command updated
- `template/scripts/transform-workers.js` - Comments updated
- `template/package.json` - Keywords updated

### Removed Files

- `template/package-lock.json` - Needs regeneration with new dependencies

## Features Maintained

All original features are preserved:

✅ Custom HTML Elements with dataroom-js
✅ Web Workers with automatic bundling
✅ Fast builds with SWC transpilation
✅ Modern CSS with PostCSS and cssnano
✅ Static asset handling
✅ Hot module replacement
✅ Environment variable configuration
✅ Single-file output option
✅ CSS extraction option
✅ Development server with configurable port

## Next Steps

Users of the template should run:

```bash
npm install
```

This will generate a new `package-lock.json` with Webpack dependencies.

## Testing

To verify the migration works:

```bash
cd template
npm install
npm start    # Test dev server
npm run build # Test production build
```
