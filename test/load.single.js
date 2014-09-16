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

  });

  // it('should load individual templates:', function () {
  //   loader.load('test/fixtures/three/*.md', {name: 'Brian Woodward'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('layouts/*.txt', {name: 'Brian Woodward'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('layouts/a.md', {foo: 'bar'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});
  //   loader.get('baz.md').should.have.property('content');
  // });

  // it('should load individual templates:', function () {
  //   loader.load({'foo/baz.md': {}}, {blah: 'blah'}); // bad format
  //   loader.get('baz.md').should.have.property('content');
  // });
});
