/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var Loader = require('..');
var loader;
var _ = require('lodash');


describe('single templates.', function () {
  beforeEach(function() {
    loader = new Loader();
  });


  /**
   * Test to following:
   *
   * Created by default:
   *
   *   - path
   *   - content
   *   - locals
   *
   * Protected (e.g. don't move or mutate these)
   *
   *   - data
   *   - orig
   */

  describe('when a string [string|object] pattern is used:', function () {
    it('should detect when the string is a filepath:', function () {
      loader.load('test/fixtures/one/a.md', {name: 'Brian Woodward'});
      loader.get('a.md').should.have.property('path', 'test/fixtures/one/a.md');
    });

    it('should read the file when the string is a valid filepath:', function () {
      loader.load('test/fixtures/one/a.md', {name: 'Brian Woodward'});
      loader.get('a.md').should.have.property('content', 'This is {{title}}');
    });

    it('should return null for content when the file path is invalid:', function () {
      loader.load('test/fixts/one/a.md', {name: 'Brian Woodward'});
      loader.get('a.md').should.have.property('content', null);
    });

    it('should get locals from the second argument:', function () {
      loader.load('test/fixtures/one/a.md', {name: 'Brian Woodward'});
      loader.get('a.md').should.have.property('locals', {name: 'Brian Woodward'});
    });

    it('should get options from the third argument:', function () {
      loader.load('test/fixtures/one/a.md', {name: 'Brian Woodward'}, {doStuff: true});
      loader.get('a.md').should.have.property('options', {doStuff: true});
      loader.get('a.md').locals.should.not.have.property('doStuff');
    });

    it('should move arbitrary props on the second arg to `locals`:', function () {
      loader.load('a', {content: 'this is content', layout: 'b'});
      loader.get('a').should.have.property('locals', {layout: 'b'});
    });

    it('should move arbitrary props on the third arg to `options`:', function () {
      loader.load('test/fixtures/*.md', {a: 'b'}, {
        engine: 'hbs'
      });
      loader.get('a.md').should.have.property('locals', {a: 'b'});
      loader.get('a.md').should.have.property('options', {engine: 'hbs'});
    });





    it('should load individual templates:', function () {
      loader.load('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
      loader.get('foo1.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
      loader.get('bar1.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
      loader.get('baz.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
      loader.get('a.txt').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load('test/fixtures/a.md', {foo: 'bar'});
      loader.get('a.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      loader.get('abc.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load('test/fixtures/b.md', 'This is content.', {name: 'Jon Schlinkert'});
      loader.get('b.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
      loader.get('foo/bar.md').should.have.property('content');
    });

    it('should load individual templates:', function () {
      loader.load({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});
      loader.get('two.md').should.have.property('content', 'this is content.');
      loader.get('two.md').should.have.property('data', {b: 'b'});
    });

    it.only('should load individual templates:', function () {
      loader.load({'foo/baz.md': {}}, {blah: 'blah'}); // bad format
      loader.get('baz.md').should.have.property('content');
    });
  });
});
