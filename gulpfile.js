import { fileURLToPath, URL } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* gulpfile.js -- Builds the assets for the style guide.
 *
 * Copyright (C) 2016 Michael Seibt
 *
 * With contributions from: -
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global process */
/* global __dirname */



/*
|--------------------------------------------------------------------------
| DEPENDENCIES
|--------------------------------------------------------------------------
*/

import gulp from 'gulp';
import gulpSass from 'gulp-sass';             // Transpiles SASS to CSS
import * as sass from 'sass';                  // Dart Sass compiler
import webpack from 'webpack';               // Used for Javascript packing
import chalk from 'chalk';                     // Terminal string styling
import { deleteAsync } from 'del';               // Removes a set of files
import { generateFonts } from 'fantasticon';     // Generates icon fonts

import gulpEslint from 'gulp-eslint-new';    // Lints JavaScript
import copy from 'gulp-copy';             // Copies files (ignores path prefixes)
import postcss from "gulp-postcss";          // Parse style sheet files
import reporter from "postcss-reporter";      // Reporter for PostCSS
import stylelint from "stylelint";             // Lints styles according to a ruleset
import scss from "postcss-scss";          // SCSS syntax for PostCSS
import plumber from 'gulp-plumber';          // Catches gulp errors and prevents exit

// Configure gulp-sass to use Dart Sass
var sassCompiler = gulpSass(sass);

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

var SOURCES     = 'assets';
var TARGET      = 'build';
var PRODUCTION  = process.argv.indexOf('--production') !== -1;


/*
|--------------------------------------------------------------------------
| STYLESHEET GENERATION AND OPTIMIZATION
|--------------------------------------------------------------------------
*/

gulp.task('styles', function () {
  return gulp
    .src(SOURCES + '/styles/app.scss')
    .pipe(plumber())
    .pipe(sassCompiler({
      unixNewlines: true,
      precision: 6,
      includePaths: [
        __dirname + '/node_modules'
      ],
      outputStyle: PRODUCTION ? 'compressed' : 'expanded'
    }).on('error', function(err) {
      // Log the error but don't fail the build
      console.log(chalk.red('Sass Error:'), err.message);
      this.emit('end');
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(TARGET + '/styles'));
});

/*
|--------------------------------------------------------------------------
| ICON FONT
|--------------------------------------------------------------------------
*/

gulp.task('icons', async function(){
  // Use fantasticon to generate icon fonts
  const fs = await import('fs/promises');
  const path = await import('path');

  // Ensure output directory exists
  const fontsDir = path.join(TARGET, 'fonts');
  await fs.mkdir(fontsDir, { recursive: true });

  await generateFonts({
    inputDir: SOURCES + '/icons',
    outputDir: TARGET + '/fonts',
    fontsUrl: '../fonts',
    name: 'SG-icons',
    fontTypes: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
    assetTypes: ['css'],
    selector: 'SG-ico',
    getIconId: ({ basename }) => {
      return basename.split('-')[1];
    },
    templates: {
      css: './assets/styles/tools/icons.hbs'
    },
    pathOptions: {
        css: './assets/styles/nuclides/icons.css'
    },
    codepoints: {
      'logo': 59905,
      'code': 59906,
      'question': 59907,
      'copy': 59908,
      'seach': 59909,
    },
    normalize: true,
    fontHeight: 1001,
    round: 10e12,
    descent: 0
  });
});

/*
|--------------------------------------------------------------------------
| CLEANING TASKS
|--------------------------------------------------------------------------
*/

/** Clean old sass files */
gulp.task('clean:styles', function () {
    return deleteAsync(TARGET + '/styles/*.css');
});

/** Clean old icon fonts */
gulp.task('clean:icons', function () {
    return deleteAsync(TARGET + '/fonts/*.*');
});

/** Clean old javascript bundles */
gulp.task('clean:scripts', function () {
    return deleteAsync(TARGET + '/scripts/*.js');
});

/** Clean old static files */
gulp.task('clean:static', function () {
    return deleteAsync([
      TARGET + '/favicon.ico'
    ]);
});


/*
|--------------------------------------------------------------------------
| JAVASCRIPT GENERATION AND OPTIMIZATION
|--------------------------------------------------------------------------
*/

/** Run WebPack and create chunks */
  gulp.task('scripts', function (callback) {
    webpack({
      context: __dirname + '/' + SOURCES + '/scripts',
      entry: {
        'app': './app.js',
      },
      output: {
        path: __dirname + '/' + TARGET + '/scripts/',
        publicPath: '/scripts/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].bundle.js'
      },
      module: {
        rules: [
          { test: /\.html$/, loader: fileURLToPath(new URL('./webpack-tpl-loader.js', import.meta.url)) }
        ]
      },
      resolve: {
        fallback: {
          path: false,
          fs: false
        },
        fullySpecified: false,
        modules: [
          __dirname + '/' + SOURCES + '/scripts',
          'node_modules'
        ]
      },
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery',
        }),
      ].concat(PRODUCTION ? [new webpack.optimize.ModuleConcatenationPlugin()] : []),
      mode: PRODUCTION ? 'production' : 'development'
    }, function(e,s) { webpack_error_handler(e,s,callback); });
  });

/*
|--------------------------------------------------------------------------
| COPY STATIC ASSETS
|--------------------------------------------------------------------------
*/

gulp.task('copy:static', function (){
  return gulp.src([
      SOURCES + '/favicon.ico'
    ])
    .pipe(copy(TARGET, {prefix: 1}));
});

/*
|--------------------------------------------------------------------------
| LINTING
|--------------------------------------------------------------------------
*/

/** Lint and check for debug code */
gulp.task('lint:scripts', function () {
  if(PRODUCTION) return;

  return gulp
    .src([
      SOURCES + '/scripts/*.js',
      SOURCES + '/scripts/**/*.js'
    ])
    .pipe(gulpEslint())
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failAfterError());
});

gulp.task('lint:styles', function () {
  return gulp.src(SOURCES + '/**/*.scss')
    .pipe(postcss([
      stylelint({ /* your options */ }),
      reporter({ clearMessages: true }),
    ], {
      syntax: scss
    }));
});

/*
|--------------------------------------------------------------------------
| WATCH TASKS
|--------------------------------------------------------------------------
*/

  gulp.task('watch:styles', function () {
    return gulp
      .watch([
        SOURCES + '/styles/*.scss',
        SOURCES + '/styles/**/*.scss',
        SOURCES + '/sprites/*.png',
        SOURCES + '/icons/*.svg'
      ], gulp.series('styles' /*, 'lint:styles' */))
      .on('change', watcher_log_callback);
  });

  gulp.task('watch:markup', function () {
     return gulp
      .watch([
        TARGET + '/index.html'
      ], function ()  {
        return gulp
          .src(TARGET + '/index.html');
      })
      .on('change', watcher_log_callback);
  });

  gulp.task('watch:scripts', function () {
     return gulp
      .watch([
        SOURCES + '/scripts/*.js',
        SOURCES + '/scripts/**/*.js'
      ], gulp.series('scripts', 'lint:scripts'))
      .on('change', watcher_log_callback);
  });

 function watcher_log_callback (event) {
   var relative_path = event.path.replace(__dirname, '');
   console.log('file ' + chalk.magenta(relative_path) + ' ' + event.type);
 }

/*
|--------------------------------------------------------------------------
| SHARED METHODS AND SETTINGS
|--------------------------------------------------------------------------
*/
function webpack_error_handler (err, stats, callback) {

  if(err) throw new Error('webpack: ' + err);
  if(PRODUCTION){
    console.log('[webpack]', stats.toString({
        // output options
        source: false
    }));
  } else {
    var jsonStats = stats.toJson({
      errorDetails: false
    });
    if(jsonStats.errors.length > 0){
        console.log(chalk.red('ERROR\n' + jsonStats.errors.join('\n')));
    }
    if(jsonStats.warnings.length > 0){
        console.log(chalk.yellow('WARNING\n' + jsonStats.warnings.join('\n')));
    }
  }

  callback();
}

/*
|--------------------------------------------------------------------------
| TASK GROUPS (DEFINED AT END TO REFERENCE ALL TASKS)
|--------------------------------------------------------------------------
*/

gulp.task('build',   gulp.series(gulp.parallel('clean:styles', 'clean:icons', 'clean:scripts', 'clean:static'), 'icons', gulp.parallel('styles', 'scripts', 'copy:static')));
gulp.task('lint',    gulp.parallel('lint:scripts'/*, 'lint:styles'*/));
gulp.task('watch',   gulp.parallel('watch:styles', 'watch:markup', 'watch:scripts'));
gulp.task('dev',     gulp.series('build', gulp.parallel('watch', 'lint')));
gulp.task('default', gulp.series('dev'));

// Temporary build task without icons (gulp-iconfont v12 ESM issue)
gulp.task('build-no-icons',   gulp.series(gulp.parallel('clean:styles', 'clean:scripts', 'clean:static'), gulp.parallel('styles', 'scripts', 'copy:static')));
