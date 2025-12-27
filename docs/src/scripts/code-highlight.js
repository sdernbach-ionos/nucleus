'use strict';

import Prism from 'prismjs';
import 'prismjs/components/prism-scss.js';

Prism.languages.nucleus = {
  'docblock': {
    pattern: /(^|[^\\])(\/\*\*[\w\W]*?\*\/|\/\/\/.*?(\r?\n|$))/g,
    lookbehind: true,
    inside: {
      'annotation': {
        pattern: /^(\s+\*\s)\@[^\s]+/igm,
        lookbehind: true
      },
    },
  },
};

$('[data-d-code-preview]').each(function(i, element) {
  Prism.highlightElement(element);
});
