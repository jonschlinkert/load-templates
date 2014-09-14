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


describe('.detectContent()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('when the first arg is a string:', function () {
    describe('when the first argument is a string, and only one argument is passed:', function () {
      it('should assume the first arg is a file path and attempt to read it:', function () {
        loader.detectContent('test/fixtures/a.md').should.equal('---\ntitle: AAA\n---\nThis is fixture a.md');
      });
    });

    describe('when the first argument is a string, and the second is an object:', function () {
      it('should assume the first arg is a file path and attempt to read it:', function () {
        loader.detectContent('test/fixtures/a.md', {a: 'b'}).should.equal('---\ntitle: AAA\n---\nThis is fixture a.md');
      });
    });

    describe('when the first argument is a string, and the second is an string:', function () {
      it('should assume the second arg is the content and should not try to read the first arg as a file path:', function () {
        loader.detectContent('test/fixtures/a.md', 'this is content').should.equal('this is content');
        loader.detectContent('abc.md', 'this is content').should.equal('this is content');
      });
    });

    describe.skip('when a file path is invalid:', function () {
      it('should throw an error:', function () {
        loader.detectContent('foo/bar/a.md').should.equal('This is fixture a.md');
      });
    });
  });

  describe('when the first arg is an object:', function () {
    describe('when a `content` property is on the object:', function () {
      it('should return the string from the `content` proprety.', function () {
        loader.detectContent({path: 'abc.md', content: 'this is content'}).should.equal('this is content');
      });
    });

    describe('when a `content` property is nested on the first object:', function () {
      it('should return the string from the nested `content` proprety.', function () {
        loader.detectContent({'abc.md': {path: 'foo/bar.md', content: 'this is content'}}).should.equal('this is content');
      });

      it.skip('should throw an error when content cannot be found:', function () {
        loader.detectContent({'abc.md': {path: 'foo/bar.md'}, 'def.md': {content: 'this is content'}});
      });
    });
  });
});

