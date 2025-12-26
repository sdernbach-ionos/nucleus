/* global describe */
/* global it */



import assert from 'assert';
import Helpers from './helpers.js';
import Verbose from '../src/Verbose.js';

describe('Verbose', function() {

  describe('#setLevel', function () {

    it('should not print something on silent mode', function () {
      Helpers.hook(Verbose, 'log');
      Verbose.setLevel(Verbose.LEVELS.SILENT);
      Verbose.error("test", []);
      assert.equal(Helpers.logCalled, 0);
    });

  });

});
