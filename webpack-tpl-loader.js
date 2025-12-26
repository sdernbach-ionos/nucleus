/**
 * Simple lodash template loader for webpack 5
 * Based on tpl-loader but compatible with webpack 5 API
 */
import _ from 'lodash';

export default function (source) {
  this.cacheable && this.cacheable();
  
  // In webpack 5, options are accessed via getOptions()
  var options = this.getOptions ? this.getOptions() : (this.options || {});
  var tplSettings = (options && options.tplSettings) || null;
  
  var template = _.template(source, tplSettings);
  return 'import _ from \'lodash\';\nexport default ' + template;
}
