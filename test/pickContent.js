/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Loader = require('..');
var loader;


describe('.pickContent()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('when the first arg is a string:', function () {
    describe('when only one argument is passed:', function () {
      it('should assume the first arg is a file path and attempt to read it:', function () {
        var files = loader.pickContent('test/fixtures/a.md');
        files.should.have.property('a.md');
        files['a.md'].should.have.property('content', 'This is fixture a.md');
      });
    });

    describe('when the second is an object:', function () {
      it('should assume the `path` property on the second arg is a file path and attempt to read it:', function () {
        var files = loader.pickContent('foo', {path: 'test/fixtures/b.md'});
        files.should.have.property('b.md');
        files['b.md'].should.have.property('content', 'This is fixture b.md');
      });

      it('should assume the first arg is a file path and attempt to read it:', function () {
        var files = loader.pickContent('test/fixtures/a.md', {a: 'b'});
        files.should.have.property('a.md');
        files['a.md'].should.have.property('data', {title: 'AAA'});
        files['a.md'].should.have.property('content', 'This is fixture a.md');
      });
    });

    describe('when the second is an string:', function () {
      it('should assume the second arg is the content and should not try to read the first arg as a file path:', function () {
        loader.pickContent('test/fixtures/a.md', 'this is content').should.equal('this is content');
        loader.pickContent('abc.md', 'this is content').should.equal('this is content');
      });
    });

    describe.skip('when a file path is invalid:', function () {
      it('should throw an error:', function () {
        loader.pickContent('foo/bar/a.md').should.equal('This is fixture a.md');
      });
    });
  });

  describe('when the first arg is an object:', function () {
    describe('when a `content` property is on the object:', function () {
      it('should return the string from the `content` proprety.', function () {
        loader.pickContent({path: 'abc.md', content: 'this is content'}).should.equal('this is content');
      });
    });

    describe('when a `content` property is nested on the first object:', function () {
      it('should return the string from the nested `content` proprety.', function () {
        loader.pickContent({'abc.md': {path: 'foo/bar.md', content: 'this is content'}}).should.equal('this is content');
      });

      it.skip('should throw an error when content cannot be found:', function () {
        loader.pickContent({'abc.md': {path: 'foo/bar.md'}, 'def.md': {content: 'this is content'}});
      });
    });
  });
});

