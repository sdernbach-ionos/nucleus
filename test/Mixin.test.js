import Helpers from './helpers.js';
import Verbose from '../src/Verbose.js';
import Mixin from '../src/entities/Mixin.js';

describe('Mixin', function() {

  it('should return nothing if the raw input is not valid', function() {
    Helpers.hook(Verbose, 'log');

    var m = new Mixin({});
    expect(m).toEqual({});

    expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
  });

  /********************************************************/

  it('should parse the parameters from the descriptor', function() {
    var m = new Mixin({
      element: {
        params: "test ($param1, $param2: true)"
      },
      annotations: {
        description: 'A test description',
        param: [
          'param1 The first parameter',
          'param2 The second description'
        ]
      }
    });

    expect(m.parameters).toEqual([{
      name: 'param1',
      optional: false,
      description: 'The first parameter'
    }, {
      name: 'param2',
      optional: true,
      description: 'The second description'
    }]);

    m = new Mixin({
      element: {
        params: "test ($param1)"
      },
      annotations: {
        description: 'A test description',
        param: 'param1 The only parameter'
      }
    });

    expect(m.parameters).toEqual([{
      name: 'param1',
      optional: false,
      description: 'The only parameter'
    }]);
  });

});
