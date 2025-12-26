# Dependency Upgrade Notes

## Summary

All dependencies have been successfully upgraded to their latest versions. The project now works with:
- Node 20.x
- Dart Sass (sass ^1.97.1) instead of deprecated node-sass
- Gulp 4
- Webpack 5
- All other dependencies at latest stable versions
- **Custom dependency-free grid system** replacing gridle

## Changes Made

### Package Upgrades
- Replaced `node-sass` with `sass` (Dart Sass)
- Updated `gulp` from 3.x to 4.x
- Updated `webpack` from 1.x to 5.x
- Updated `mocha`, `nyc` (replacing istanbul), and other dev dependencies
- Updated all runtime dependencies (chalk, color, lorem-ipsum, etc.)
- **Removed `gridle` dependency** - replaced with custom CSS-based grid system

### Code Fixes
- Updated `Color.js` for new `color` package API
- Updated `Substitute.js` for new `lorem-ipsum` package API
- Updated both gulpfiles for Gulp 4 syntax (series/parallel instead of array dependencies)
- Created custom webpack 5 compatible template loader (tpl-loader is webpack 4 only)
- Fixed Sass output style from "nested" to "expanded" (Dart Sass only supports "expanded" and "compressed")
- Fixed icon template comments from `//` to `/* */` for CSS compatibility
- **Replaced gridle with custom flexbox-based grid system** maintaining same class names and functionality

### Test Results
- ✅ All 64 tests pass
- ✅ Build completes successfully
- ✅ Nucleus CLI generates styleguides successfully

## Grid System Replacement

The unmaintained `gridle` library (incompatible with modern Dart Sass) has been replaced with a custom, dependency-free CSS grid system in `assets/styles/nuclides/grid.scss`.

### Features
- **Zero dependencies** - pure CSS/Sass implementation using flexbox
- **Same class names** - fully compatible with existing markup (`SG-gr-*`, `SG-row`, etc.)
- **Responsive** - supports mobile and tablet breakpoints
- **12-column grid** - maintains the same 12-column layout with 20px gutters
- **Text alignment utilities** - includes `.SG-txt-center`, `.SG-txt-right`, `.SG-txt-left`
- **Responsive modifiers** - supports `@mobile` and `@tablet` variants

### Class Examples
```html
<div class="SG-row">
  <div class="SG-gr-6">Half width</div>
  <div class="SG-gr-6">Half width</div>
</div>

<div class="SG-row">
  <div class="SG-gr-12 SG-txt-center@mobile">Full width, centered on mobile</div>
</div>
```

## Security

Run `npm audit` to see current security status. Some vulnerabilities exist in transitive dependencies of older packages (gulp-imagemin, etc.) but these are dev dependencies only and don't affect production usage of nucleus.
