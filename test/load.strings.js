/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var assert = require('assert');
var path = require('path');
var chalk = require('chalk');
var matter = require('gray-matter');
var Loader = require('..');
var loader = new Loader();

function heading(str) {
  return chalk.green(str) + chalk.bold(' pattern:');
}

function subhead(str) {
  return chalk.green(str);
}

describe(chalk.green('strings'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe(heading('[ string ]'), function () {
    describe('when the string is a valid file path:', function () {
      it('should load a template from the file:', function () {
        var files = loader.load('test/fixtures/a.md');
        files.should.have.properties('test/fixtures/a.md');
        files['test/fixtures/a.md'].should.have.properties('content', 'path');
      });
      it('should read the file:', function () {
        var files = loader.load('test/fixtures/a.md');
        files['test/fixtures/a.md'].should.have.property('content', '---\ntitle: AAA\n---\nThis is fixture a.md');
      });
    });

    describe('when the string is a valid glob pattern:', function () {
      it('should load a template from the file:', function () {
        var files = loader.load('test/fixtures/*.md');
        files.should.have.properties('test/fixtures/a.md');
        files.should.have.properties('test/fixtures/b.md');
        files.should.have.properties('test/fixtures/c.md');
        files['test/fixtures/a.md'].should.have.properties('content', 'path');
        files['test/fixtures/b.md'].should.have.properties('content', 'path');
        files['test/fixtures/c.md'].should.have.properties('content', 'path');
      });
      it('should read each file:', function () {
        var files = loader.load('test/fixtures/*.md');
        files['test/fixtures/a.md'].should.have.property('content', '---\ntitle: AAA\n---\nThis is fixture a.md');
        files['test/fixtures/b.md'].should.have.property('content', '---\ntitle: BBB\n---\nThis is fixture b.md');
        files['test/fixtures/c.md'].should.have.property('content', '---\ntitle: CCC\n---\nThis is fixture c.md');
      });
    });
  });

  describe(heading('[ string | string ]'), function () {
    it('should assume the second arg is `content`.', function () {
      var files = loader.load('abc.md', 'This is content.');
      files['abc.md'].should.have.property('content', 'This is content.');
    });

    it('should assume the first arg is the template key.', function () {
      var files = loader.load('abc.md', 'This is content.');
      files['abc.md'].should.have.property('path', 'abc.md');
    });

    it('should assume the key is not a file path.', function () {
      var files = loader.load('abc.md', 'This is content.');
      files['abc.md'].should.have.property('path', 'abc.md');
    });

    it('should extend the object with `locals`', function () {
      var files = loader.load('abc.md', 'This is content.', {a: 'b'}, {locals: {c: 'd'}});
      files['abc.md'].should.have.property('locals', {a: 'b', c: 'd'});
    });

    it('should extend the object with `options`', function () {
      var files = loader.load('abc.md', 'This is content.', {a: 'b'}, {c: 'd'});
      files['abc.md'].should.have.property('locals', {a: 'b'});
      files['abc.md'].should.have.property('options', {c: 'd'});
    });
  });

  describe(heading('[ string | object ]'), function () {
    describe(subhead('valid filepath:'), function () {
      it('should detect when the string is a filepath:', function () {
        var files = loader.load('test/fixtures/one/a.md');
        files['test/fixtures/one/a.md'].should.have.property('path', 'test/fixtures/one/a.md');
      });

      it('should read the file and return an object:', function () {
        var files = loader.load('test/fixtures/a.md');
        assert.equal(typeof files['test/fixtures/a.md'], 'object');
      });

      it('should extend the object with `content` from the file:', function () {
        var files = loader.load('test/fixtures/one/a.md');
        files['test/fixtures/one/a.md'].should.have.property('content', '---\ntitle: A\n---\n\nThis is {{title}}\n');
      });

      it('should extend the object with the `path` for the file:', function () {
        var files = loader.load('test/fixtures/a.md');
        files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
      });

      it('should read a file and add a content property:', function () {
        var files = loader.load('test/fixtures/a.md');
        files['test/fixtures/a.md'].should.have.property('content', '---\ntitle: AAA\n---\nThis is fixture a.md');
      });

      it('should extend the object with `locals`:', function () {
        var files = loader.load('test/fixtures/a.md', {a: 'b'});
        files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
      });

      it('should extend the object with `options`:', function () {
        var files = loader.load('test/fixtures/a.md', {a: 'b'}, {something: true});
        files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/a.md'].should.have.property('options', {something: true});
      });

      it('should create `content` from parsed file string:', function () {
        var files = loader.load('test/fixtures/a.md');
        files['test/fixtures/a.md'].should.have.property('content', '---\ntitle: AAA\n---\nThis is fixture a.md');
      });

      it('should keep `locals` and `data` from front matter separate:', function () {
        var files = loader.load('test/fixtures/a.md', {a: 'b'});
        files['test/fixtures/a.md'].should.have.property('locals', { a: 'b' });
        files['test/fixtures/a.md'].should.have.property('content', '---\ntitle: AAA\n---\nThis is fixture a.md');
      });

      it('should assume the second object is locals:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {a: 'b'});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
      });

      it('should detect options on the second object and split them from locals:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {a: 'b', options: {foo: true}});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
        tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true});
      });

      it('should flatten locals from the second object:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {a: 'b', locals: {c: 'd'}});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b', c: 'd'});
      });
    });

    describe(heading('[ string | object | object ]'), function () {
      it('should detect the last object as locals:', function () {
        var tmpl = loader.load('a.md', {content: 'abc'}, {c: 'c'});
        tmpl['a.md'].should.have.properties('path', 'content', 'locals');
        tmpl['a.md'].should.have.property('locals', {c: 'c'});
        tmpl.should.eql({'a.md': {path: 'a.md', content: 'abc', locals: {c: 'c'}}});
      });

      it('should merge locals from the second object and last object:', function () {
        var tmpl = loader.load('a.md', {content: 'abc', locals: {b: 'b'}}, {c: 'c'});
        tmpl.should.eql({'a.md': {path: 'a.md', content: 'abc', locals: {b: 'b', c: 'c'}}});
      });

      it('should detect locals on the second object:', function () {
        var tmpl = loader.load('a.md', {content: 'abc', a: 'a'});
        tmpl['a.md'].should.have.property('locals', {a: 'a'});
        tmpl.should.eql({'a.md': {path: 'a.md', content: 'abc', locals: {a: 'a'}}});
      });

      it('should sift locals and options correctly:', function () {
        var tmpl = loader.load('a.md', {content: 'abc', a: 'a', options: {b: 'b'}}, {c: 'c'});
        tmpl['a.md'].should.have.property('locals', {a: 'a', c: 'c'});
        tmpl['a.md'].should.have.property('options', {b: 'b'});
      });

      it('should assume the second object is locals:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {a: 'b'}, {foo: true});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
        tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true});
      });

      it('should assume the third object is options:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {a: 'b'}, {foo: true});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
        tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true});
      });

      it('should merge locals from the second and third objects:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {a: 'b'}, {locals: {c: 'd'}, bar: false});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b', c: 'd'});
      });

      it('should flatten locals from the second and third objects:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {locals: {a: 'a'}, b: 'b'}, {locals: {c: 'c'}, bar: false});
        tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'a', b: 'b', c: 'c'});
      });

      it('should merge options from the second and third objects:', function () {
        var tmpl = loader.load('test/fixtures/*.txt', {options: {foo: true}}, {bar: false});
        tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true, bar: false});
      });

      it('should flatten options from the second and third objects:', function () {
        var files = loader.load('test/fixtures/*.txt', {options: {foo: true}}, {options: {bar: false}});
        files['test/fixtures/a.txt'].should.have.property('options', {foo: true, bar: false});
      });
    });

    describe(subhead('valid glob pattern:'), function () {
      it('should expand glob patterns:', function () {
        var files = loader.load('test/fixtures/*.txt');
        (typeof files).should.equal('object');
        files['test/fixtures/a.txt'].should.have.property('path');
      });

      it('should read files and return an object for each:', function () {
        var files = loader.load('test/fixtures/*.txt');
        (typeof files).should.equal('object');
        files['test/fixtures/a.txt'].should.have.property('path');
        files['test/fixtures/b.txt'].should.have.property('path');
        files['test/fixtures/c.txt'].should.have.property('path');
      });

      it('should extend the objects with locals:', function () {
        var files = loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'});
        files['test/fixtures/a.txt'].should.have.property('locals', {name: 'Brian Woodward'});
        files['test/fixtures/b.txt'].should.have.property('locals', {name: 'Brian Woodward'});
        files['test/fixtures/c.txt'].should.have.property('locals', {name: 'Brian Woodward'});
      });

      it('should extend the objects with a `path` property.', function () {
        var files = loader.load('test/fixtures/*.txt');
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
        files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
        files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
      });

      it('should extend the objects with `content` from the file:', function () {
        var files = loader.load('test/fixtures/*.txt');
        files['test/fixtures/a.txt'].should.have.property('content', '---\ntitle: AAA\n---\nThis is from a.txt.');
        files['test/fixtures/b.txt'].should.have.property('content', '---\ntitle: BBB\n---\nThis is from b.txt.');
        files['test/fixtures/c.txt'].should.have.property('content', '---\ntitle: CCC\n---\nThis is from c.txt.');
      });

      it('should extend the objects with `options`:', function () {
        var files = loader.load('test/fixtures/*.txt', {a: 'b'}, {c: true});
        files['test/fixtures/a.txt'].should.have.property('options', {c: true});
        files['test/fixtures/b.txt'].should.have.property('options', {c: true});
        files['test/fixtures/c.txt'].should.have.property('options', {c: true});
      });

      it('should detect options passed on the locals object:', function () {
        var files = loader.load('test/fixtures/*.txt', {a: 'b', options: {b: 'b'}}, {c: true});

        files['test/fixtures/a.txt'].should.have.property('options', {b: 'b', c: true});
        files['test/fixtures/b.txt'].should.have.property('options', {b: 'b', c: true});
        files['test/fixtures/c.txt'].should.have.property('options', {b: 'b', c: true});

        // ensure that locals is correct
        files['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/b.txt'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/c.txt'].should.have.property('locals', {a: 'b'});
      });

      it('should parse front matter:', function () {
        var files = loader.load('test/fixtures/*.txt');
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt')
        files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt')
        files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt')
      });

      it('should create `content` from parsed file string:', function () {
        var files = loader.load('test/fixtures/*.txt');
        files['test/fixtures/a.txt'].should.have.property('content', '---\ntitle: AAA\n---\nThis is from a.txt.');
        files['test/fixtures/b.txt'].should.have.property('content', '---\ntitle: BBB\n---\nThis is from b.txt.');
        files['test/fixtures/c.txt'].should.have.property('content', '---\ntitle: CCC\n---\nThis is from c.txt.');
      });

      it('should keep `locals` and `data` from front matter separate:', function () {
        var files = loader.load('test/fixtures/*.txt', {a: 'b'});
        files['test/fixtures/a.txt'].should.have.property('locals', { a: 'b' });
      });

      it('should move arbitrary props on the third arg to `options`:', function () {
        var files = loader.load('test/fixtures/*.md', {a: 'b'}, {engine: 'hbs'});
        files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/a.md'].should.have.property('options', {engine: 'hbs'});
      });

      it('should throw an error when first arg is a glob and second arg is a string:', function () {
        (function () {
          loader.load('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
        }).should.throw('load-templates#loadString: invalid second argument: flflflfl');
      });
    });

    describe(subhead('non-filepath, non-glob pattern:'), function () {
      it('should move arbitrary props on the second arg to `locals`:', function () {
        var files = loader.load('a', {content: 'this is content', layout: 'b'});
        files['a'].should.have.property('locals', {layout: 'b'});
      });

      it('should load individual templates:', function () {
        var files = loader.load('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
        files['foo1.md'].should.have.property('content');
      });

      it('should load when content is a property on an object.', function () {
        var files = loader.load('a.md', {content: 'c'});
        files['a.md'].should.have.property('content', 'c');
      });

      it('should load even if the key is an invalid filepath.', function () {
        var files = loader.load('a.md', 'b');
        files['a.md'].should.have.property('content', 'b');
        files['a.md'].should.have.property('path', 'a.md');
      });

      it('should detect content passed as a second arg', function () {
        var files = loader.load('foo/bar/abc.md', 'This is content.');
        files['foo/bar/abc.md'].should.have.property('path');
        files['foo/bar/abc.md'].content.should.equal('This is content.');
      });

      it('should detect locals passed as a third arg', function () {
        var files = loader.load('foo/bar/abc.md', 'This is content.', { a: 'b' });
        files['foo/bar/abc.md'].should.have.property('locals', { a: 'b' });
      });

      it('should detect options passed as a fourth arg', function () {
        var files = loader.load('foo/bar/abc.md', 'This is content.', { a: 'b' }, { c: 'd' });
        files['foo/bar/abc.md'].should.have.property('locals', { a: 'b' }, { c: 'd' });
      });

      describe('when the second arg is an object:', function () {
        it('should use the first arg as the key.', function () {
          var files = loader.load('a', {content: 'A above\n{{body}}\nA below', layout: 'b'});
          files['a'].should.have.property('content', 'A above\n{{body}}\nA below');
          files['a'].should.have.property('locals', {layout: 'b'});
        });
      });
    });
  });

  describe(heading('glob patterns'), function () {
    var expected = {
      'test/fixtures/a.txt': {
        content: '---\ntitle: AAA\n---\nThis is from a.txt.',
        path: 'test/fixtures/a.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/b.txt': {
        content: '---\ntitle: BBB\n---\nThis is from b.txt.',
        path: 'test/fixtures/b.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/c.txt': {
        content: '---\ntitle: CCC\n---\nThis is from c.txt.',
        path: 'test/fixtures/c.txt',
        locals: {a: 'b'},
        options: {foo: true}
      }
    };

    it('should read a glob of files and return an object of templates.', function () {
      var actual = loader.load('test/fixtures/*.txt', {a: 'b'}, {foo: true});
      actual.should.eql(expected);
    });
  });
});
