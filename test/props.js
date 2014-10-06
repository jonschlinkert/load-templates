/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var should = require('should');
var matter = require('gray-matter');
var utils = require('../lib/utils');
var Loader = require('..');
var loader = new Loader();

function heading(str) {
  return chalk.magenta(str);
}

function subhead(str) {
  return chalk.cyan(str);
}

describe(heading('should normalize properties'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe('path and content properties', function () {
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
    it('should normalize options', function () {
      var files = loader.load('a', {content: 'This is content.', options: {ext: '.foo'}});
      files.should.eql({a: {path: 'a', content: 'This is content.', ext: '.foo', options: {ext: '.foo'}}});
    });

    it('should normalize locals', function () {
      var files = loader.load('a', {content: 'This is content.'}, {ext: '.foo'});
      files.should.eql({a: {path: 'a', content: 'This is content.', ext: '.foo'}});
    });
  });

  describe('locals', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {a: 'b'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', a: 'b'});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', a: 'b'}});
      files.should.eql(expected);
    });
    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', a: 'b'});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {a: 'b'});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.load('a/b/c.md', 'this is content.', {locals: {a: 'b'}});
        files.should.eql(expected);
      });
    });
  });

  describe('options', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', a: 'b', options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.load({ 'a/b/c.md': { content: 'this is content.', a: 'b', options: {y: 'z'}}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', a: 'b'}, {y: 'z'});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.load('a/b/c.md', {content: 'this is content.', a: 'b'}, {options: {y: 'z'}});
      files.should.eql(expected);
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
