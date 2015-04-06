/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var _ = require('lodash');
var path = require('path');
var chalk = require('chalk');
var matter = require('gray-matter');
var Loader = require('..');
var loader = new Loader();

function heading(str) {
  return chalk.magenta(str);
}
function subhead(str) {
  return chalk.cyan(str);
}

describe(heading('should normalize properties'), function () {

  describe('root properties', function () {
    beforeEach(function () {
      loader = new Loader();
    });

    var expected = { 'a/b/c.md': { path: 'a/b/c.md', ext: '.md', content: 'this is content.'}};

    it('should move non-root properties to locals', function () {
      var files = loader.load({path: 'a', content: 'b', a: 'b', c: 'd'});
      files.should.eql({a: {path: 'a', content: 'b', locals: {a: 'b', c: 'd'}}});
    });

    it('should allow custom root keys to be defined with `.option`', function () {
      loader = new Loader();
      loader.option('rootKeys', ['a']);

      var files = loader.load({path: 'a', content: 'b', a: 'b', c: 'd'});
      files.should.eql({a: {path: 'a', content: 'b', a: 'b', locals: {c: 'd'}}});
    });

    it('should allow custom rootKeys to be passed on the constructor', function () {
      loader = new Loader({rootKeys: ['a', 'c']});

      var files = loader.load({path: 'a', content: 'b', a: 'b', c: 'd'});
      files.should.eql({a: {path: 'a', content: 'b', a: 'b', c: 'd'}});
    });
  });

  describe('path and content properties', function () {
    beforeEach(function () {
      loader = new Loader();
    });

    var expected = { 'a/b/c.md': { path: 'a/b/c.md', ext: '.md', content: 'this is content.'}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.'});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.'});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.');
        files.should.eql(expected);
      });
    });
  });

  describe('sparse fields:', function () {
    beforeEach(function () {
      loader = new Loader();
    });

    it('should normalize options', function () {
      var files = loader.load('a', {content: 'This is content.'}, {}, {ext: '.foo'});
      files.should.eql({a: {path: 'a', content: 'This is content.', options: {ext: '.foo'}}});
    });

    it('should normalize locals', function () {
      var files = loader.load('a', {content: 'This is content.'}, {ext: '.foo'});
      files.should.eql({a: {path: 'a', content: 'This is content.', options: {ext: '.foo'}}});
    });
    it('should normalize locals and options', function () {
      var files = loader.load('a', {content: 'This is content.'}, {ext: '.foo'}, {ext: '.bar'});
      files.should.eql({a: {path: 'a', content: 'This is content.', locals: {ext: '.foo'}, options: {ext: '.bar'}}});
    });
  });

  describe('locals', function () {
    beforeEach(function () {
      loader = new Loader();
    });

    var expected = { 'a/b/c.md': { path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {a: 'b'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}}});
      files.should.eql(expected);
    });
    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {locals: {a: 'b'}});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {locals: {a: 'b'}});
        files.should.eql(expected);
      });
    });
  });

  describe('third arg', function () {
    beforeEach(function () {
      loader = new Loader();
    });

    var expected = { 'a/b/c.md': { path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}}, {y: 'z'});
      files.should.eql({
        'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.', locals: { a: 'b'}, options: {y: 'z'}, ext: '.md'}
      });
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', a: 'b'}, {options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', a: 'b', options: {y: 'z'}});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {a: 'b'}, {options: {y: 'z'}});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {a: 'b', options: {y: 'z'}});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {locals: {a: 'b'}, options: {y: 'z'}});
        files.should.eql(expected);
      });
    });
  });
});
