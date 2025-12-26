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

'use strict';

/*
|--------------------------------------------------------------------------
| DEPENDENCIES
|--------------------------------------------------------------------------
*/

var gulp        = require('gulp');
var gulpSass    = require('gulp-sass');             // Transpiles SASS to CSS
var sass        = require('sass');                  // Dart Sass compiler
var webpack     = require('webpack');               // Used for Javascript packing
var livereload  = require('gulp-livereload');       // Reloads the browser window after changes
var gutil       = require('gulp-util');             // Utility toolbox
var del         = require('del');                   // Removes a set of files
var iconfont    = require('gulp-iconfont');         // Generates an icon-font
var consolidate = require('gulp-consolidate');      // Passes a file to a template engine
var rename      = require("gulp-rename");           // Renames a set of files
var logwarn     = require('gulp-logwarn');          // Warns on leftover debug code
var jshint      = require('gulp-jshint');           // Hints JavaScript
var copy        = require('gulp-copy');             // Copies files (ignores path prefixes)
var postcss     = require("gulp-postcss");          // Parse style sheet files
var reporter    = require("postcss-reporter");      // Reporter for PostCSS
var stylelint   = require("stylelint");             // Lints styles according to a ruleset
var scss        = require("postcss-scss");          // SCSS syntax for PostCSS
var plumber     = require('gulp-plumber');          // Catches gulp errors and prevents exit

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
var LOG_CODE   = [
    'console.log', 'console.warn', 'console.info', 'debugger;'
];

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
      gutil.log(gutil.colors.red('Sass Error:'), err.message);
      this.emit('end');
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(TARGET + '/styles'))
    .pipe(livereload());
});

/*
|--------------------------------------------------------------------------
| ICON FONT
|--------------------------------------------------------------------------
*/

gulp.task('icons', function(){
  return gulp.src(SOURCES + '/icons/*.svg')
    .pipe(iconfont({
      fontName: 'SG-icons', // required
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available
    }))
      .on('glyphs', function(glyphs) {
        gulp.src(SOURCES + '/styles/tools/icons.lodash.css')
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontName: 'SG-icons',
            fontPath: '../fonts/',
            className: 'SG-ico'
          }))
          .pipe(rename({ basename: 'icons' }))
          .pipe(gulp.dest(SOURCES + '/styles/nuclides/'));
      })
    .pipe(gulp.dest(TARGET + '/fonts/'));
});

/*
|--------------------------------------------------------------------------
| CLEANING TASKS
|--------------------------------------------------------------------------
*/

/** Clean old sass files */
gulp.task('clean:styles', function () {
    return del(TARGET + '/styles/*.css');
});

/** Clean old icon fonts */
gulp.task('clean:icons', function () {
    return del(TARGET + '/fonts/*.*');
});

/** Clean old javascript bundles */
gulp.task('clean:scripts', function () {
    return del(TARGET + '/scripts/*.js');
});

/** Clean old static files */
gulp.task('clean:static', function () {
    return del([
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
        'app': './app',
      },
      output: {
        path: __dirname + '/' + TARGET + '/scripts/',
        publicPath: '/scripts/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].bundle.js'
      },
      module: {
        rules: [
          { test: /\.html$/, loader: require.resolve('./webpack-tpl-loader.js') }
        ]
      },
      resolve: {
        fallback: {
          path: false,
          fs: false
        },
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
    .pipe(logwarn(LOG_CODE))
    .pipe(jshint.reporter('jshint-stylish'));
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

  gulp.task('livereload', function () {
    gutil.log(gutil.colors.bgGreen.white('Starting LiveReload ...'));
    gutil.log(gutil.colors.green('When developing locally make sure ',
      '"Allow access to file URLs"'));
     gutil.log(gutil.colors.green('is ticked for LiveReload in Chrome\'s' +
     ' Extensions settings'));
    livereload.listen();
  });

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
          .src(TARGET + '/index.html')
          .pipe(livereload());
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
   gutil.log('file ' + gutil.colors.magenta(relative_path) + ' ' + event.type);
 }

/*
|--------------------------------------------------------------------------
| SHARED METHODS AND SETTINGS
|--------------------------------------------------------------------------
*/
function webpack_error_handler (err, stats, callback) {

  if(err) throw new gutil.PluginError('webpack', err);
  if(PRODUCTION){
    gutil.log('[webpack]', stats.toString({
        // output options
        source: false
    }));
  } else {
    var jsonStats = stats.toJson({
      errorDetails: false
    });
    if(jsonStats.errors.length > 0){
        gutil.log(gutil.colors.red('ERROR\n' + jsonStats.errors.join('\n')));
    }
    if(jsonStats.warnings.length > 0){
        gutil.log(gutil.colors.yellow('WARNING\n' + jsonStats.warnings.join('\n')));
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
gulp.task('watch',   gulp.parallel('watch:styles', 'watch:markup', 'watch:scripts', 'livereload'));
gulp.task('dev',     gulp.series('build', gulp.parallel('watch', 'lint')));
gulp.task('default', gulp.series('dev'));
