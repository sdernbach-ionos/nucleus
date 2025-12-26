import Helpers from './helpers.js';
import Verbose from '../src/Verbose.js';
import Transform from '../src/Transform.js';

describe('Transform', function() {

  /********************************************************/

  describe('#hasAnnotation', function () {

    it('should return true if the style has the annotation', function () {
      expect(Transform.hasAnnotation('color', {annotations: {color: true}})).toBe(true);
    });
    it('should return false if the style does not have the annotation', function () {
      expect(Transform.hasAnnotation('test', {annotations: {color: true}})).toBe(false);
    });
  });

  /********************************************************/

  describe('#getStyleType', function () {

    it('should return the type of the style', function () {
     expect(Transform.getStyleType({annotations: {'color' : true}})).toBe('color');
     expect(Transform.getStyleType({annotations: {'mixin' : true}})).toBe('mixin');
     expect(Transform.getStyleType({annotations: {'structure' : true}})).toBe('structure');
     expect(Transform.getStyleType({annotations: {'atom' : true}})).toBe('atom');
     expect(Transform.getStyleType({annotations: {'nuclide' : true}})).toBe('nuclide');
     expect(Transform.getStyleType({annotations: {'molecule' : true}})).toBe('molecule');
    });

    it('should return null if the style has an invalid or no type', function () {
      Helpers.hook(Verbose, 'log');

      var styleType = Transform.getStyleType({
        annotations: {'whatever' : true},
        file: 'Test',
        element: {source: {start: {line:1}}}
      });

      expect(styleType).toBe(null);
      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
    });

    it('should throw an error if the style has multiple types', function () {
      Helpers.hook(Verbose, 'log');

      var styleType = Transform.getStyleType({annotations: {'color' : true, 'nuclide' : true}});

      expect(styleType).toBe('nuclide');
      expect(Helpers.logCalled).toBe(2); // Multi-line text
    });

  });

});
