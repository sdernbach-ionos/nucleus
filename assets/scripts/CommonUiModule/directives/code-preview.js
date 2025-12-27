/* code-preview.js -- Applies PrismJS highlighting to code containers
 *
 * Copyright (C) 2016 Michael Seibt
 *
 * With contributions from: -
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/** Dependencies */
import Prism from 'prismjs';

/** Attachments */
import 'prismjs/components/prism-scss.js';

/** Directive */
$('[data-d-code-preview]').each(function (i, element ) {
  Prism.highlightElement(element);
});
