import Helpers from './helpers.js';
import Entity from '../src/entities/Entity.js';
import Verbose from '../src/Verbose.js';

describe('Entity', function() {

  /********************************************************/

  it('should set a default values as fallback', function() {
    var e = new Entity({
      type: 'nuclide',
      annotations: {}
    });

    e.fillable = ['description', 'deprecated'];

    expect(e.validate()).toBe(true);
    expect(e.raw.annotations.description).toBe('');
    expect(e.raw.annotations.deprecated).toBe(false);
  });

  /********************************************************/

  describe('#getSection', function() {

    it('should return the trimmed section value', function() {
      var e = new Entity({
        type: 'nuclide',
        annotations: {}
      });

      // Input is already fine
      e.raw.annotations.section = 'Section > Subsection';
      expect(e.getSection()).toBe('Section > Subsection');

      e.raw.annotations.section = ' Section > Subsection ';
      expect(e.getSection()).toBe('Section > Subsection');

      e.raw.annotations.section = '> Section > Subsection >';
      expect(e.getSection()).toBe('Section > Subsection');

      e.raw.annotations.section = ' > Section > Subsection> ';
      expect(e.getSection()).toBe('Section > Subsection');
    });

  });

  /********************************************************/

  describe('#validate', function() {

    it('should complain if the entity has no annotations', function() {
      var e = new Entity({});

      Helpers.hook(Verbose, 'log');
      expect(e.validate()).toBe(false);
      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
    });

    it('should complain if the entity has invalid annotations', function() {
      Helpers.hook(Verbose, 'log');

      var e = new Entity({
        type: 'nuclide',
        annotations: {
          'allowed': true,
        }
      });

      // All good
      e.fillable = ['allowed'];
      expect(e.validate()).toBe(true);
      expect(Helpers.logCalled).toBe(0);

      // Invalid annotation
      e.fillable = [];
      expect(e.validate()).toBe(false);
      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
    });

    it('should complain if the sections value is malformed', function() {

      var e = new Entity({
        type: 'nuclide',
        annotations: {
          'section': '> Section > Ok'
        }
      });
      e.fillable = ['section'];

      // Beginning of the string
      Helpers.hook(Verbose, 'log');
      expect(Helpers.logCalled).toBe(0);
      expect(e.validate()).toBe(true);
      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);

      // End of string
      e.raw.annotations.section = 'Section > ok >';
      Helpers.hook(Verbose, 'log');
      expect(Helpers.logCalled).toBe(0);
      expect(e.validate()).toBe(true);
      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
    });

    it('should complain if the sections value is not a string', function() {

      var e = new Entity({
        type: 'nuclide',
        annotations: {
          'section': true
        }
      });
      e.fillable = ['section'];

      // Beginning of the string
      Helpers.hook(Verbose, 'log');
      expect(Helpers.logCalled).toBe(0);
      expect(e.validate()).toBe(false);
      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
    });

  });
});
