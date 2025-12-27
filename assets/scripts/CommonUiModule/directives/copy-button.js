/* copy-button.js -- Provides functionality for markup copy
 *
 * Copyright (C) 2016 Michael Seibt
 *
 * With contributions from: -
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/** Dependencies */
import SweetAlert2 from 'sweetalert2';
import Clipboard from 'clipboard';

/** Directive */
$('[data-d-copy]').each(function (i, element ) {
  var copy = new Clipboard(element);
  copy.on('success', function () {
    SweetAlert2({
      title: "Copied!",
      type: "success",
      toast: true,
      showConfirmButton: false,
      position: 'top-right',
      timer: 1500
    });
  });

});
