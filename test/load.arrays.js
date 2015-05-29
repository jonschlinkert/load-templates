/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var path = require('path');
var chalk = require('chalk');
var matter = require('gray-matter');
var Loader = require('..');
var loader = new Loader();

function heading(str) {
  return chalk.magenta(str) + chalk.bold(' pattern:');
}

function subhead(str) {
  return chalk.cyan(str);
}

describe(chalk.magenta('arrays'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

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

  describe(heading('[ array ]'), function () {
    describe(subhead('valid glob pattern:'), function () {
      it('should expand an array of glob patterns:', function () {
        var files = loader.load(['test/fixtures/*.txt']);
        (typeof files).should.equal('object');
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
      });

      it('should read files and return an object for each:', function () {
        var files = loader.load(['test/fixtures/*.txt']);
        (typeof files).should.equal('object');
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
        files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
        files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
      });

      it('should create a `path` property from each filepath.', function () {
        var files = loader.load(['test/fixtures/*.txt']);
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
        files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
        files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
      });

      it('should make the `path` relative to the cwd.', function () {
        var files = loader.load([path.join(process.cwd(), 'test/fixtures/*.txt')]);
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
        files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
        files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
      });

      it('should not make the `path` relative when the first character is a slash.', function () {
        var loader = new Loader({relative: false});
        var files = loader.load('/a/b/c/d', {content: 'this is content...'});
        files['/a/b/c/d'].should.have.property('path', '/a/b/c/d');
      });

      it('should extend the objects with locals:', function () {
        var files = loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'});
        files['test/fixtures/a.txt'].should.have.property('locals', {name: 'Brian Woodward'});
        files['test/fixtures/b.txt'].should.have.property('locals', {name: 'Brian Woodward'});
        files['test/fixtures/c.txt'].should.have.property('locals', {name: 'Brian Woodward'});
      });

      it('should extend the objects with locals and options:', function () {
        var files = loader.load(['test/fixtures/*.md', 'test/fixtures/*.txt'], {a: 'b'}, {
          engine: 'hbs'
        });

        files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/a.md'].should.have.property('options', {engine: 'hbs'});
        files['test/fixtures/a.txt'].should.have.property('options', {engine: 'hbs'});
      });

      it('should extend the objects with a `path` property.', function () {
        var files = loader.load(['test/fixtures/*.txt']);
        files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
        files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
        files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
      });

      it('should extend the objects with `content` from the file:', function () {
        var files = loader.load(['test/fixtures/*.txt']);
        files['test/fixtures/a.txt'].should.have.property('content', '---\ntitle: AAA\n---\nThis is from a.txt.');
        files['test/fixtures/b.txt'].should.have.property('content', '---\ntitle: BBB\n---\nThis is from b.txt.');
        files['test/fixtures/c.txt'].should.have.property('content', '---\ntitle: CCC\n---\nThis is from c.txt.');
      });

      it('should extend the objects with `options`:', function () {
        var files = loader.load(['test/fixtures/*.txt'], {a: 'b'}, {c: true});
        files['test/fixtures/a.txt'].should.have.property('options', {c: true});
        files['test/fixtures/b.txt'].should.have.property('options', {c: true});
        files['test/fixtures/c.txt'].should.have.property('options', {c: true});
      });

      it('should detect options passed on the locals object:', function () {
        var files = loader.load(['test/fixtures/*.txt'], {a: 'b', options: {b: 'b'}}, {c: true});
        files['test/fixtures/a.txt'].should.have.property('options', {b: 'b', c: true});
        files['test/fixtures/b.txt'].should.have.property('options', {b: 'b', c: true});
        files['test/fixtures/c.txt'].should.have.property('options', {b: 'b', c: true});

        // ensure that locals is correct
        files['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/b.txt'].should.have.property('locals', {a: 'b'});
        files['test/fixtures/c.txt'].should.have.property('locals', {a: 'b'});
      });

      it('should keep `locals` and `data` from front matter separate:', function () {
        var files = loader.load(['test/fixtures/*.txt'], {a: 'b'});
        files['test/fixtures/a.txt'].should.have.property('locals', { a: 'b' });
      });
    });
  });

  describe(heading('[ array | object ]'), function () {
    it('should assume the second object is locals:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {a: 'b'});
      tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
    });

    it('should detect options on the second object and split them from locals:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {a: 'b', options: {foo: true}});
      tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
      tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true});
    });

    it('should flatten locals from the second object:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {a: 'b', locals: {c: 'd'}});
      tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b', c: 'd'});
    });
  });

  describe(heading('[ array | object | object ]'), function () {
    it('should assume the second object is locals:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {a: 'b'}, {foo: true});
      tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
      tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true});
    });

    it('should assume the third object is options:', function () {
      var files = loader.load(['test/fixtures/*.txt'], {a: 'b'}, {foo: true});
      files.should.eql(expected);
    });

    it('should merge locals from the second and third objects:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {a: 'b'}, {locals: {c: 'd'}, bar: false});
      tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'b', c: 'd'});
    });

    it('should flatten locals from the second and third objects:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {locals: {a: 'a'}, b: 'b'}, {locals: {c: 'c'}, bar: false});
      tmpl['test/fixtures/a.txt'].should.have.property('locals', {a: 'a', b: 'b', c: 'c'});
    });

    it('should merge options from the second and third objects:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {options: {foo: true}}, {bar: false});
      tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true, bar: false});
    });

    it('should flatten options from the second and third objects:', function () {
      var tmpl = loader.load(['test/fixtures/*.txt'], {options: {foo: true}}, {options: {bar: false}});
      tmpl['test/fixtures/a.txt'].should.have.property('options', {foo: true, bar: false});
    });
  });
});
