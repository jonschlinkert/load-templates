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


describe('options', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('single templates', function () {
    it('should detect options passed as a fourth argument', function () {
      loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'}, {opts: true});
      loader.get('abc.md').options.should.have.property('opts', true);
    });

    it('should detect options passed on the `options` of the third arg', function () {
      loader.load('abc.md', 'This is content.', {options: {opts: true}});
      loader.get('abc.md').options.should.have.property('opts', true);
    });

    it('should detect options passed on the `options` of the second arg', function () {
      loader.load('abc.md', {options: {opts: true}});
      loader.get('abc.md').options.should.have.property('opts', true);
    });

    it('should not have a locals property', function () {
      loader.load('abc.md', {options: {opts: true, locals: {a: 'b'}}});
      loader.get('abc.md').options.should.not.have.property('locals');
    });

    it('should detect options passed on the `options` of the first arg', function () {
      loader.load({path: 'abc.md', content: 'foo', options: {opts: true}});
      loader.get('abc.md').options.should.have.property('opts', true);
    });
  });
});
