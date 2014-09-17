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


describe('multiple templates.', function () {
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

      loader.get('a.md').should.have.property('data', {title: 'A'});
      loader.get('a.md').should.have.property('content');
    });

    it.skip('should load [string|object]:', function () {
      loader.load(['test/fixtures/*.md', 'test/fixtures/*.txt'], {a: 'b'}, {
        engine: 'hbs'
      });
      loader.get('a.md').should.have.property('locals', {a: 'b'});
      loader.get('a.md').should.have.property('options', {engine: 'hbs'});
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
