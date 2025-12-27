import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { globSync } from 'glob';
import { chain } from 'underscore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* gulpfile.js -- Builds the assets for the style guide documentation pages
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
import path from 'path';                  // Path utilities
import gulpSass from 'gulp-sass';             // Transpiles SASS to CSS
import * as sass from 'sass';                  // Dart Sass compiler
import pug from 'gulp-pug';              // Thin layer for Pug
import { generateFonts } from 'fantasticon';     // Generates icon fonts
import chalk from 'chalk';                     // Terminal string styling
import plumber from 'gulp-plumber';          // Catches gulp errors and prevents exit
import imagemin from 'gulp-imagemin';         // Optimizes images
import merge from 'merge-stream';          // Merges two streams
import spritesmith from 'gulp.spritesmith';      // Generates a spritesheet
import buffer from 'vinyl-buffer';          // Creates a vinyl file buffer
import autoprefixer from 'gulp-autoprefixer';     // Adds prefixes to css properties if needed
import { deleteAsync } from 'del';                // Removes a set of files
import webpack from 'webpack';               // Used for Javascript packing

// Configure gulp-sass to use Dart Sass
var sassCompiler = gulpSass(sass);

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

var config = {
  // Build config version
  version: 1,

  // Root folder for source files
  sources: 'src',

  // Root folder for target
  target: 'build',

  // Flag to indicate a production-ready build
  production: process.argv.indexOf('--production') !== -1,

  // Warn for these logging leftovers in the source
  logwarn: [
    'console.log', 'console.warn', 'console.info', 'debugger;'
  ]
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

  /**
   * Hashes a set of files with a given "tolerance"
   */
  var makeHash = function (files, tolerance) {
    tolerance = tolerance || 5;
    var allFiles = [],
      fileData = new Buffer(0),
      algorithm = 'sha1';

      allFiles = allFiles.concat(globSync(files, { mark: true }));
      files = allFiles;

    files = chain(files.sort())
      .unique(true)
      .filter(function(file) {
          return (file[file.length-1] !== '/');
      })
      .value();

    files.forEach(function(file) {
      fileData = Buffer.concat([fileData, readFileSync(file)]);
    });

    var hash = createHash(algorithm);
    hash.update(fileData);

    return hash.digest('hex').substring(0, tolerance);
  };

  var webpack_error_handler = function (err, stats, callback) {

    if(err) throw new Error('webpack: ' + err);
    if(config.production){
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
  };

/*
|--------------------------------------------------------------------------
| VIEWS
|--------------------------------------------------------------------------
*/

gulp.task('build:views', function () {
  return gulp
    .src([
      config.sources + '/views/*.pug',
      config.sources + '/views/doc/*.pug'
    ], { allowEmpty: true })
    .pipe(plumber())
    .pipe(pug({
      // ...
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.target));
});

/*
|--------------------------------------------------------------------------
| SCRIPTS
|--------------------------------------------------------------------------
*/

  gulp.task('build:scripts', function (callback) {
    webpack({
     // watch: !config.production, TODO!
      context: __dirname + '/' + config.sources + '/scripts',
      entry: {
        'app': './app',
      },
      output: {
        path: __dirname + '/' + config.target + '/scripts/',
        publicPath: '/scripts/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].bundle.js'
      },
      resolve: {
        fullySpecified: false,
        extensions: ['.js', '.json'],
        fallback: {
          path: false,
          fs: false
        },
        modules: [
          __dirname + '/' + config.sources + '/scripts',
          'node_modules'
        ]
      },
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery',
        }),
      ].concat(config.production ? [new webpack.optimize.ModuleConcatenationPlugin()] : []),
      mode: config.production ? 'production' : 'development'
    }, function(e,s) { webpack_error_handler(e,s,callback); });
  });


/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

gulp.task('build:styles', function () {
  return gulp
    .src(config.sources + '/styles/app.scss')
    .pipe(plumber())
    .pipe(sassCompiler({
      unixNewlines: true,
      precision: 6,
      includePaths: [
        path.resolve(__dirname, '..', 'node_modules'),
        path.resolve(__dirname, '..', 'assets', 'styles')
      ],
      outputStyle: config.production ? 'compressed' : 'expanded'
    }).on('error', sassCompiler.logError))
    .pipe(autoprefixer())
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.target + '/styles'));
});

/*
|--------------------------------------------------------------------------
| ICONS
|--------------------------------------------------------------------------
*/

gulp.task('build:icons', async function () {
  // Use fantasticon to generate icon fonts
  const fs = await import('fs/promises');
  const path = await import('path');

  // Ensure output directory exists
  const fontsDir = path.join(config.target, 'fonts');
  await fs.mkdir(fontsDir, { recursive: true });

  await generateFonts({
    inputDir: config.sources + '/icons',
    outputDir: config.target + '/fonts',
    fontsUrl: '../fonts',
    name: 'icons',
    fontTypes: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
    assetTypes: ['css'],
    selector: 'ico',
    getIconId: ({ basename }) => {
      return basename.split('-')[1];
    },
    templates: {
      css: './src/styles/templates/icons.hbs'
    },
    pathOptions: {
      css: config.target + '/../src/styles/nuclides/icons.css'
    },
    codepoints: {
      'logo': 59905,
      'github': 59907,
      'tools': 59908,
      'molecule': 59909,
      'rescue': 59910,
      'search': 59911,
      'glide': 59912,
    },
    normalize: true,
    fontHeight: 1001,
    round: 10e12,
    descent: 0
  });
});

/*
|--------------------------------------------------------------------------
| SPRITES
|--------------------------------------------------------------------------
*/

gulp.task('build:sprites', function () {
  // Hash the content of the sprite elements folders to bust the cache.
  var hash = makeHash([
    config.sources + '/sprites/*.png',
    '!' + config.sources + '/sprites/logo-*.png'
  ]);

  // Create the data for our spritesheet
  var sprite = gulp
    .src([config.sources + '/sprites/*.png', '!' + config.sources + '/sprites/logo-*.png'])
    .pipe(plumber())
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprites.scss',
      imgPath: '../images/sprite.png?v='+hash+'--'+config.version,
      retinaSrcFilter: config.sources + '/sprites/*@2x.png',
      retinaImgName: 'sprite@2x.png',
      padding: 0,
      retinaImgPath: '../images/sprite@2x.png?v='+hash+'--'+config.version,
      cssTemplate: config.sources + '/styles/templates/sprites.handlebars'
    }));


  // Pipe image stream through image optimizer and onto disk
  var imgStream = sprite.img
      .pipe(buffer())
      .pipe(imagemin())
      .pipe(gulp.dest(config.target + '/images/'));

  // Write SASS to disc
  var cssStream = sprite.css.pipe(gulp.dest(config.sources + '/styles/nuclides/'));

  // Return a merged stream to handle all `end` events
  return merge(imgStream, cssStream);
});

/*
|--------------------------------------------------------------------------
| STATIC IMAGES
|--------------------------------------------------------------------------
*/

gulp.task('copy:images', function () {
  return gulp
    .src([
      config.sources + '/images/*.png',
      config.sources + '/images/*.jpg'
    ], { encoding: false })
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(config.target + '/images'));
});

gulp.task('copy:favicon', function () {
  return gulp
    .src(config.sources + '/favicon.ico')
    .pipe(gulp.dest(config.target));
});

/*
|--------------------------------------------------------------------------
| LINTING
|--------------------------------------------------------------------------
*/

gulp.task('lint:styles', function () {});
gulp.task('lint:scripts', function () {});

/*
|--------------------------------------------------------------------------
| CLEANING
|--------------------------------------------------------------------------
*/

gulp.task('clean:scripts', function () {
  return deleteAsync(config.target + '/scripts/*.js');
});

gulp.task('clean:styles', function () {
  return deleteAsync(config.target + '/styles/*.css');
});

/*
|--------------------------------------------------------------------------
| WATCHING
|--------------------------------------------------------------------------
*/

  gulp.task('watch:styles', function () {
    return gulp
      .watch([
        config.sources + '/styles/*.scss',
        config.sources + '/styles/**/*.scss',
        config.sources + '/sprites/*.png',
        config.sources + '/icons/*.svg',
        '../styleguide/assets/**/*.scss'
      ], gulp.series('build:styles', 'lint:styles'))
      .on('change', watcher_log_callback);
  });

  gulp.task('watch:views', function () {
     return gulp
      .watch([
        config.sources + '/views/*.pug',
        config.sources + '/views/**/*.pug',
      ], gulp.series('build:views'))
      .on('change', watcher_log_callback);
  });

  gulp.task('watch', gulp.parallel('watch:views', 'watch:styles'));

  function watcher_log_callback (event) {
    var relative_path = event.path.replace(__dirname, '');
    console.log('file ' + chalk.magenta(relative_path) + ' ' + event.type);
  }

/*
|--------------------------------------------------------------------------
| TASK GROUPS (DEFINED AT END TO REFERENCE ALL TASKS)
|--------------------------------------------------------------------------
*/

gulp.task('copy',     gulp.parallel('copy:images', 'copy:favicon'));
gulp.task('build',    gulp.series(gulp.parallel('clean:scripts', 'clean:styles'), gulp.parallel('build:sprites', 'build:icons'), gulp.parallel('build:views', 'build:styles', 'build:scripts')));
gulp.task('dist',     gulp.series('build', 'copy'));
gulp.task('dev',      gulp.series('build', 'copy', 'watch'));
gulp.task('default',  gulp.series('dev'));
