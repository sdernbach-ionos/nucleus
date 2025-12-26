# Dependency Upgrade Notes

## Summary

All dependencies have been successfully upgraded to their latest versions. The project now works with:
- Node 20.x
- Dart Sass (sass ^1.97.1) instead of deprecated node-sass
- Gulp 4
- Webpack 5
- All other dependencies at latest stable versions

## Changes Made

### Package Upgrades
- Replaced `node-sass` with `sass` (Dart Sass)
- Updated `gulp` from 3.x to 4.x
- Updated `webpack` from 1.x to 5.x
- Updated `mocha`, `nyc` (replacing istanbul), and other dev dependencies
- Updated all runtime dependencies (chalk, color, lorem-ipsum, etc.)

### Code Fixes
- Updated `Color.js` for new `color` package API
- Updated `Substitute.js` for new `lorem-ipsum` package API
- Updated both gulpfiles for Gulp 4 syntax (series/parallel instead of array dependencies)
- Created custom webpack 5 compatible template loader (tpl-loader is webpack 4 only)
- Fixed Sass output style from "nested" to "expanded" (Dart Sass only supports "expanded" and "compressed")
- Fixed icon template comments from `//` to `/* */` for CSS compatibility

### Test Results
- ✅ All 64 tests pass
- ✅ Build completes successfully
- ✅ Nucleus CLI generates styleguides successfully

## Known Issue: Gridle Grid System

**Note:** The `gridle` grid system (v2.0.48) is incompatible with modern Dart Sass due to use of `@extend` across media queries, which is not allowed in Sass.

### Workaround Applied
The gridle import has been temporarily commented out in `assets/styles/app.scss`:
```scss
// @import "nuclides/grid";  // Temporarily disabled - gridle is incompatible with Dart Sass
```

### Impact
The styleguide layout will not have the responsive grid classes. The core functionality of nucleus still works perfectly.

### Recommendations for Future
1. **Option 1:** Migrate to a modern CSS grid system (CSS Grid, Flexbox, or modern framework like Tailwind)
2. **Option 2:** Fork and patch gridle to use mixins instead of extends
3. **Option 3:** Use a different Sass-compatible grid library

The gridle library appears to be unmaintained (last update 2016), so migration to a modern alternative is recommended.

## Security

Run `npm audit` to see current security status. Some vulnerabilities exist in transitive dependencies of older packages (gulp-imagemin, etc.) but these are dev dependencies only and don't affect production usage of nucleus.
