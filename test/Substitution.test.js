import Helpers from './helpers.js';
import Verbose from '../src/Verbose.js';
import Substitute from '../src/Substitute.js';

describe('Substitution', function () {

  it('complains about invalid shortcodes', function () {
    Helpers.hook(Verbose, 'log');
    Substitute.substitute('@{lipsums}');
    expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
  });

  /********************************************************/

  it('should not break if no markup is present', function () {
    Substitute.substitute();
  });

  /********************************************************/

  it('resolves to image urls', function () {
    var markup = 'Test @{image:300:300}';
    var subs = Substitute.substitute(markup);

    expect(subs.indexOf('Test')).toBe(0);
    expect(subs.indexOf('https://unsplash.it/')).not.toBe(-1);

  });

  /********************************************************/

  it('resolves dummy text', function () {
    var markup = 'Test @{lipsum:1:words}';
    var subs = Substitute.substitute(markup);

    expect(subs.indexOf('Test')).toBe(0);
    expect(subs.indexOf('{lipsum')).toBe(-1);

    markup = 'Test @{lipsum:1:letter}';
    subs = Substitute.substitute(markup);
    expect(subs.indexOf('Test')).toBe(0);
    expect(subs.indexOf('{lipsum')).toBe(-1);

    markup = '@{lipsum:1:words}';
    subs = Substitute.substitute(markup);
    expect(subs.split(' ').length).toBe(1);

    markup = '@{lipsum:3:words}';
    subs = Substitute.substitute(markup);
    expect(subs.split(' ').length).toBe(3);

  });
});
