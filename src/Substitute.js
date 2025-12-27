/* Substitute.js -- Scans and resolves placeholders in annotations
 *
 * Copyright (C) 2016 Michael Seibt
 *
 * With contributions from: -
 *  - Ryan Potter (www.ryanpotter.co.nz)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */



import { get, set } from './utils.js';
import { loremIpsum } from 'lorem-ipsum';
import Verbose from './Verbose.js';

var Substitute = {
  map: {},
  methods: {},
  staticLipsum: false,
  placeholderService: false
};

Substitute.injectConfig = function ( config ) {
  this.staticLipsum = config.staticLipsum;
  this.placeholderService = config.placeholderService;
  return this;
};

Substitute.process = function ( styles ) {

  var style, s, markup;

  // First, collect a map of all selector styles with markup annotation
  for(s in styles) {
    style = styles[s];
    var selector = get(style, 'element.selector');
    markup = get(style, 'annotations.markup');
    if(selector && markup && (selector.indexOf(':') === -1)){
      this.map[selector] = markup;
    }
  }

  // Loop through all styles again and apply substitutions
  for(s in styles) {
    style = styles[s];
    markup = get(style, 'annotations.markup');
    if(markup) {
      set(style, 'annotations.markup', this.substitute(markup));
    }
  }

  return styles;
};

Substitute.substitute = function ( markup ) {
  if(!markup || markup.trim() === '') {
    return markup;
  }

  var match;
  while (( match = markup.match(/@{([^}]+)}/) )) {
    var interpolation = this.resolve(match[1]);
    markup = markup.replace(match[0], interpolation);
  }

  return markup;
};

Substitute.resolve = function (shortcode) {
  var segments = shortcode.split(':');
  var method = segments.shift();
  if(this.methods[method]) {
    return this.methods[method].apply(this, segments);
  }

  Verbose.warn('invalid_substitution', [shortcode] );
};

Substitute.methods.lipsum = function (quantity, type) {
  quantity = Math.max(quantity, 1);
  if(['paragraphs', 'words', 'sentences'].indexOf(type) === -1) {
    type = 'paragraphs';
  }

  var rnd = 0.01;
  
  return loremIpsum({
    count: quantity,
    units: type,
    random: this.staticLipsum ? function() {
      if(rnd>=1) rnd = 0.01;
      rnd += 0.01;
      return rnd;
    } : Math.random
  });
};

Substitute.methods.include = function ( selector ) {
  var markup = _.get(this.map, selector);

  if(markup) {
    return markup;
  }

  // If the selector is not visible / existing, show
  // a warning and return an empty string.
  Verbose.warn('unknown_selector', [selector]);
  return '';
};

Substitute.methods.image = function (width, height) {
  // If there's a config for a replacement placeholder
  // service, then override the default.
  if(this.placeholderService) {
    return eval('`'+this.placeholderService+'`');
  } else {
    return 'https://unsplash.it/'+width+'/'+height+(this.staticLipsum ? '' : '?random=' + Math.random());
  }
};

export default Substitute;
