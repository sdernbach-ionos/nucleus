import Helpers from './helpers.js';
import Verbose from '../src/Verbose.js';
import Crawler from '../src/Crawler.js';

describe('Crawler', function() {

  /********************************************************/

  describe('#isAnnotationLine', function () {
    it('should recognize a default annotation line', function () {
      expect(Crawler.isAnnotationLine("@test")).toBe(true);
    });

    it('should not recognize an invalid annotation line', function () {
      expect(Crawler.isAnnotationLine("test")).toBe(false);
    });

    it('should not recognize a content line as annotation', function () {
      expect(Crawler.isAnnotationLine(" test")).toBe(false);
    });
  });

  /********************************************************/

  describe('#nextNode', function () {
    it('should return the next element from a set and remove it', function () {
      var set = [1,2];
      expect(Crawler.nextNode(set)).toBe(1);
      expect(set.length).toBe(1);
    });
    it('should throw an error on empty sets', function () {
      var set = [];

      Helpers.hook(Verbose, 'log');
      Helpers.hook(Verbose, 'exit');

      Crawler.nextNode(set);

      expect(Helpers.logCalled).toBe(2);
      expect(Helpers.exitCalled).toBe(1);
    });
  });

  /********************************************************/

  describe('#isDocBlock', function () {
    it('should return false if not input was passed', function () {
      expect(Crawler.isDocBlock()).toBe(false);
    });

    it('should not detect single starred comments as DocBlock', function () {
      expect(Crawler.isDocBlock("@test")).toBe(false);
    });

    it('should not detect single starred comments with value as DocBlock', function () {
      expect(Crawler.isDocBlock("@test value")).toBe(false);
    });

    it('should detect single line comments as DocBlock', function () {
      expect(Crawler.isDocBlock("* @test")).toBe(true);
    });

    it('should detect single line comments with value as DocBlock', function () {
      expect(Crawler.isDocBlock("* @test value")).toBe(true);
    });

    it('should detect multiline DocBlocks', function () {
      expect(Crawler.isDocBlock("*\n * @test")).toBe(true);
    });

    it('should detect multiline DocBlocks with Windows EOLs', function () {
      expect(Crawler.isDocBlock("*\r\n * @test")).toBe(true);
    });
  });

  /********************************************************/

  describe('#getAnnotation', function () {
    it('should parse an annotation without value', function () {
      expect(Crawler.getAnnotation("@test")).toEqual({key: 'test', value: true});
    });

    it('should parse an annotation with value', function () {
      expect(Crawler.getAnnotation("@test abc")).toEqual({key: 'test', value: 'abc'});
    });

    it('should parse an annotation with HTML value', function () {
      expect(Crawler.getAnnotation("@test <div></div>")).toEqual({key: 'test', value: '<div></div>'});
    });

    it('should return multiline content', function () {
      expect(Crawler.getAnnotation(" <div> </div> ")).toEqual({value: '<div> </div> ', type: 'content'});
    });

    it('should return multiline content indented with tabs', function () {
      expect(Crawler.getAnnotation("\t<div> </div> ")).toEqual({value: '<div> </div> ', type: 'content'});
    });

    it('should return false is no annotation line', function () {
      expect(Crawler.getAnnotation("Whatever i am")).toBe(false);
    });
  });

  /********************************************************/

  describe('#removeCommentChars', function () {
    it('should remove single line DocBlock star', function () {
      expect(Crawler.removeCommentChars('* @test')).toBe('@test');
    });
    it('should remove single line trailing spaces', function () {
      expect(Crawler.removeCommentChars('* @test ')).toBe('@test');
    });
    it('should remove single line DocBlock star', function () {
      expect(Crawler.removeCommentChars('* @test')).toBe('@test');
    });
    it('should remove multi line DocBlock stars', function () {
      expect(Crawler.removeCommentChars('*\n * @test')).toBe('@test');
    });
    it('should remove multi line DocBlock stars for multiple annotations', function () {
      expect(Crawler.removeCommentChars('*\n * @test\n * @test2')).toBe('@test\n@test2');
    });
    it('should remove multi line DocBlock stars for multiple annotations in indented blocks', function () {
      expect(Crawler.removeCommentChars(
        '   *\n'+
        '    * @test\n'+
        '    * @test2'
      )).toBe('\n@test\n@test2');
    });
    it('should remove multi line DocBlock stars for multiple annotations and values', function () {
      expect(Crawler.removeCommentChars('*\n * @test 111\n * @test2 222')).toBe('@test 111\n@test2 222');
    });
    it('should remove multi line DocBlock stars for multiple annotations and some values', function () {
      expect(Crawler.removeCommentChars('*\n * @test 111\n * @test2 ')).toBe('@test 111\n@test2');
    });
    it('should remove multi line DocBlock stars for multiple annotations and description', function () {
      expect(Crawler.removeCommentChars(
          '*\n'+
          ' * Desc  \n'+
          ' * \n'+
          ' * @test 111\n'+
          ' * @test2 222')).toBe('Desc\n\n@test 111\n@test2 222');
    });
  });

/********************************************************/

  describe('#getDescription', function () {
    it('Should return a description if one is present', function () {
      var lines = 'Description line 1\nand two.\n@test'.split('\n');
      expect(Crawler.getDescription(lines)).toBe('Description line 1 and two.');
    });

    it('Should remove description lines from the input array', function () {
      var lines = 'Description line 1\nand two.\n@test'.split('\n');
      Crawler.getDescription(lines);
      expect(JSON.stringify(lines)).toBe('["@test"]');
    });

    it('Should return false if no description is present', function () {
      var lines = '@test1\n@test'.split('\n');
      expect(Crawler.getDescription(lines)).toBe(false);
    });
  });

  /********************************************************/

  describe('#addAnnotationByType', function () {
    it('should add a new annotation', function () {
      var annotation = {key: 'test', value: true};
      var annotations = {};
      expect(JSON.stringify(Crawler.addAnnotationByType(annotation, annotations))).toBe(JSON.stringify({'test' : true}));
    });

    it('should add a new annotation with value', function () {
      var annotation = {key: 'test', value: 'okay'};
      var annotations = {};
      expect(JSON.stringify(Crawler.addAnnotationByType(annotation, annotations))).toBe(JSON.stringify({'test' : 'okay'}));
    });

    it('should add a to an existing annotation', function () {
      var annotation = {key: 'test', value: 'okay'};
      var annotations = {'test' : 'first'};
      expect(JSON.stringify(Crawler.addAnnotationByType(annotation, annotations))).toBe(JSON.stringify({'test' : ['first', 'okay']}));
    });

    it('should add a single-line value to an existing set of annotation values', function () {
      var annotation = {key: 'test', value: 'okay'};
      var annotations = {'test' : ['first', 'second']};
      expect(JSON.stringify(Crawler.addAnnotationByType(annotation, annotations, 'test'))).toBe(JSON.stringify({'test' : ['first', 'second', 'okay']}));
    });

    it('should add new multiline content to precessor', function () {
      var annotation = {type: 'content', value: 'okay'};
      var annotations = {};
      expect(JSON.stringify(Crawler.addAnnotationByType(annotation, annotations, 'test'))).toBe(JSON.stringify({'test' : 'okay'}));
    });

    it('should add multiline content to existing precessor', function () {
      var annotation = {type: 'content', value: 'okay'};
      var annotations = {'test' : true};
      expect(Crawler.addAnnotationByType(annotation, annotations, 'test')).toEqual({'test' : 'okay'});

      expect(Crawler.addAnnotationByType(annotation, annotations, 'test')).toEqual({'test' : 'okay\nokay'});
    });

    it('should not add multiline content to existing precessor if it does not exist', function () {
      Helpers.hook(Verbose, 'log');

      var annotation = {type: 'content', value: 'okay'};
      var annotations = {'another' : true};
      Crawler.addAnnotationByType(annotation, annotations, 'test');

      expect(Helpers.logCalled).toBeGreaterThanOrEqual(1);
    });

    it('should add a multi-line value to an existing set of annotation values', function () {
      var annotation = {type: 'content', value: 'okay'};
      var annotations = {'test' : ['first', 'second']};
      expect(JSON.stringify(Crawler.addAnnotationByType(annotation, annotations, 'test'))).toBe(JSON.stringify({'test' : ['first', 'second\nokay']}));
    });

    it('should throw an error if no last annotation was given', function () {
      var annotation = {type: 'content', value: 'okay'};
      var annotations = {'test' : true};

      Helpers.hook(Verbose, 'log');
      Helpers.hook(Verbose, 'exit');

      Crawler.addAnnotationByType(annotation, annotations, null);

      expect(Helpers.logCalled).toBe(1);
      expect(Helpers.exitCalled).toBe(0);
    });
  });

  /********************************************************/

  describe('#processFile', function () {
    it('works?', function () {
      Crawler.processFile('./test/component.scss');
    });
  });

});
