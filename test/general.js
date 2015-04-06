/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/* deps:mocha */
require('should');
var fs = require('fs');
var path = require('path');
var relative = require('relative');
var matter = require('gray-matter');
var Loader = require('..');
var loader;


describe('loader:', function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe('_format', function () {
    it('should throw an error when an invalid format is passed.', function () {
      (function() {
        loader._format(42);
      }).should.throw('loader#_format() expects an array, string, object or function.');
    });
  });

  describe('normalizeObject', function () {
    it('should throw an error if object is missing path and content properties.', function () {
      (function () {
        loader.normalizeObject({a: 'b', c: 'd'});
      }).should.throw('load-templates normalizeObject expects a `path` or `content` property.');
    });
  });

  describe('normalizeString', function () {
    it('should return an empty object when the first arg is an unexpanded glob pattern:', function () {
      loader.normalizeString('\\*.js').should.eql({});
    });
  });

  describe('readFn', function () {
    it('should use the default `readFn` to read files.', function () {
      loader.readFn('test/fixtures/a.txt').should.match(/title: AAA/);
    });

    it('should use a custom `readFn` to read files.', function () {
      var str = loader.readFn('test/fixtures/a.txt', {
        readFn: function (fp) {
          var res = fs.readFileSync(fp, 'utf8');
          return res.replace(/AAA/, 'BBB');
        }
      });
      str.should.match(/title: BBB/);
    });
  });

  describe('mapFiles', function () {
    it('should use the default `mapFiles` to map files.', function () {
      var template = loader.mapFiles('test/fixtures/a.txt');
      template.should.have.property('test/fixtures/a.txt', '---\ntitle: AAA\n---\nThis is from a.txt.');
    });

    it('should use a custom `mapFiles` to map files.', function () {
      var template = loader.mapFiles('test/fixtures/a.txt', {
        mapFiles: function (fp) {
          var str = fs.readFileSync(fp, 'utf8');
          var name = path.basename(fp, path.extname(fp));
          var file = {};
          file[name] = {path: relative(fp), content: str};
          return file;
        }
      });

      template.should.have.property('a', {
        path: 'test/fixtures/a.txt',
        content: '---\ntitle: AAA\n---\nThis is from a.txt.'
      });
    });
  });

  describe('random usage', function () {
    it('should normalize a template with a non-filepath key.', function () {
      var files = loader.load('foo', {content: 'this is content.'});
      files.should.eql({'foo': {path: 'foo', content: 'this is content.'}});
    });

    it('should detect options on a template with a non-filepath key.', function () {
      var files = loader.load('foo', {content: 'this is content.', a: 'b'}, {fez: 'foo'});
      files.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b'}, options: {fez: 'foo'}}});
    });

    it('should detect locals on a template with a non-filepath key.', function () {
      var files = loader.load({'foo': {content: 'this is content.', a: 'b'}}, {fez: 'foo'});
      files.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b', fez: 'foo'}}});
    });

    it('random stuff', function () {
      var ctx = {
        locals: {
          engine: '_',
          name: 'Jon Schlinkert',
          layout: 'sidebar',
          helpers: {
            include: function(name) {
              var filepath = path.join('test/fixtures', name);
              return fs.readFileSync(filepath, 'utf8');
            },
            wrap: function(str) {
              return '(' + str + ')';
            }
          }
        },
      };

      var tmpl = loader.load('abc', {content: '<%= wrap(include("content.tmpl")) %> This is a page!'}, ctx);
      tmpl['abc'].should.have.properties('locals');
      tmpl['abc'].locals.should.have.properties('engine', 'layout', 'helpers');
    });

    it('should load multiple templates:', function () {
      var files = loader.load({
        'a/b/a.md': {content: 'this is content'},
        'a/b/b.md': {content: 'this is content'},
        'a/b/c.md': {content: 'this is content'}
      }, {a: 'b'}, {c: true});

      files['a/b/a.md'].should.have.property('path', 'a/b/a.md');
      files['a/b/b.md'].should.have.property('path', 'a/b/b.md');
      files['a/b/c.md'].should.have.property('path', 'a/b/c.md');

      files['a/b/a.md'].should.have.property('content', 'this is content');
      files['a/b/b.md'].should.have.property('content', 'this is content');
      files['a/b/c.md'].should.have.property('content', 'this is content');

      files['a/b/a.md'].should.have.property('locals', { a: 'b' });
      files['a/b/b.md'].should.have.property('locals', { a: 'b' });
      files['a/b/c.md'].should.have.property('locals', { a: 'b' });

      files['a/b/a.md'].should.have.property('options', { c: true } );
      files['a/b/b.md'].should.have.property('options', { c: true } );
      files['a/b/c.md'].should.have.property('options', { c: true } );
    });
  });
});
