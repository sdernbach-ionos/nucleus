#!/usr/bin/env node

/* index.js -- Bootstraps the application and starts the pipeline
 *
 * Copyright (C) 2016 Michael Seibt
 *
 * With contributions from:
 *  - Marco Vito Moscaritolo (@mavimo)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Config from './src/Config.js';
import Verbose from './src/Verbose.js';
import Crawler from './src/Crawler.js';
import Transform from './src/Transform.js';
import Substitute from './src/Substitute.js';
import SearchIndex from './src/SearchIndex.js';
import jade from 'pug';
import { sync as mkdirpSync } from 'mkdirp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
|--------------------------------------------------------------------------
| BOOTSTRAP
|--------------------------------------------------------------------------
|
| We need to collect configuration and environment information before
| starting the application.
|
*/

// If requested, run the init script and stop the execution here
if(Config.shouldRunInit()) {
  await import('./init.js');
  process.exit(0);
}

var config = Config.parse();
Verbose.setLevel(config.verbose);
Verbose.start();
Verbose.status('Found ' + config.files.length + ' files.');

/*
|--------------------------------------------------------------------------
| CRAWL
|--------------------------------------------------------------------------
|
| Start the parser that crawls the stylesheets for DocBlock annotations.
|
*/

var styles = [];
for(var f in config.files) {
  var file = config.files[f];
  Verbose.spin('Crawling ' + file);
  var style = Crawler.processFile(file);
  styles = styles.concat(style);
}

/*
|--------------------------------------------------------------------------
| TRANSFORM
|--------------------------------------------------------------------------
|
| Prepare the styleguide data for view generation.
|
*/

Verbose.spin('Analyzing styles');
styles = Substitute.injectConfig(config).process(styles);
var styleguides = Transform.forView(styles);

Verbose.spin('Creating search index');
var searchIndex = SearchIndex.create(styleguides);

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
|
| Generate the view files.
|
*/

Verbose.spin('Generating files');

// Create the target folder
mkdirpSync(config.target);

// Build the template files
var templateFiles = ['atoms', 'molecules', 'index', 'nuclides', 'structures'];
for(var t in templateFiles) {
  Verbose.spin('Generating files');
  var html = jade.renderFile(config.template.replace(/\/$/, '')+'/'+templateFiles[t]+'.pug', {
    styles : styleguides,
    index: searchIndex,
    meta: {
      css: config.css,
      title: config.title,
      namespace: config.namespace,
      counterCSS: config.counterCSS,
      scripts: config.scripts,
      demo: !!config.demo
    }
  });
  fs.writeFileSync('./'+config.target+'/'+templateFiles[t]+'.html', html);
}

// Copy assets
if(config.target !== 'build') {
mkdirpSync(config.target + '/styles');
mkdirpSync(config.target + '/fonts');
mkdirpSync(config.target + '/scripts');

fs
  .writeFileSync(config.target + '/styles/app.css',
    fs.readFileSync(__dirname + '/build/styles/app.css'));
fs
  .writeFileSync(config.target + '/scripts/app.js',
    fs.readFileSync(__dirname + '/build/scripts/app.js'));
fs
  .writeFileSync(config.target + '/favicon.ico',
    fs.readFileSync(__dirname + '/build/favicon.ico'));
fs
  .writeFileSync(config.target + '/fonts/SG-icons.eot',
    fs.readFileSync(__dirname + '/build/fonts/SG-icons.eot'));
fs
  .writeFileSync(config.target + '/fonts/SG-icons.ttf',
    fs.readFileSync(__dirname + '/build/fonts/SG-icons.ttf'));
fs
  .writeFileSync(config.target + '/fonts/SG-icons.woff',
    fs.readFileSync(__dirname + '/build/fonts/SG-icons.woff'));

}

/*
|--------------------------------------------------------------------------
| THANKS FOR YOUR ATTENTION
|--------------------------------------------------------------------------
*/

Verbose.finished();
