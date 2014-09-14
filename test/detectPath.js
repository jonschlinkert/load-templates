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


describe('.detectPath()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('string:', function () {
    describe('when the first arg is a string:', function () {
      describe('when only one arg is passed:', function () {
        it('should return the first argument.', function () {
          loader.detectPath('abc.md').should.equal('abc.md');
        });
      });

      describe('when the second arg is a string:', function () {
        it('should return the first argument.', function () {
          loader.detectPath('abc.md', 'this is content').should.equal('abc.md');
        });
      });

      describe('when the second arg is an object that does NOT have `path` property:', function () {
        it('should return the first argument.', function () {
          loader.detectPath('abc.md', {content: 'this is content'}).should.equal('abc.md');
        });
      });
      describe('when the second arg is an object that DOES have a path property:', function () {
        it('should return the value from the `path` property.', function () {
          loader.detectPath('abc.md', {path: 'full/path.md', content: 'this is content'}).should.equal('full/path.md');
        });
      });
    });
  });

  describe('object:', function () {
    describe('when the first arg is an object:', function () {
      it('should return a `path` property if found directly on the object.', function () {
        loader.detectPath({path: 'abc.md', content: 'this is content'}).should.equal('abc.md');
      });

      it('should return a nested `path` property on the first object:', function () {
        loader.detectPath({'abc.md': {path: 'foo/bar.md', content: 'this is content'}}).should.equal('foo/bar.md');
      });

      it.skip('should throw an error if a `path` was not found:', function () {
        loader.detectPath({'abc.md': {content: 'this is content'}, 'def.md': {path: 'foo/bar.md', }}).should.equal('foo/bar.md');
      });


      describe('when the first object only has one key:', function () {
        describe('when the key matches path-like regexp patterns:', function () {
          it('should return the key of the first object as a last resort.', function () {
            loader.detectPath({'abc.md': {content: 'this is content'}}).should.equal('abc.md');
          });
        });
        describe.skip('when the key does NOT match path-like regexp patterns:', function () {
          it('should throw an error, since all other alternatives were exhausted.', function () {
            loader.detectPath({'abcmd': {content: 'this is content'}}).should.equal('abc.md');
          });
        });
      });
    });
  });
});

