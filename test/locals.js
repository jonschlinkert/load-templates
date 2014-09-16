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


describe('locals', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('single templates', function () {
    it('should detect locals passed on the `locals` of the third arg', function () {
      loader.load('abc.md', 'This is content.', {locals: {foo: true}});
      loader.get('abc.md').locals.should.have.property('foo', true);
    });

    it('should remove the options property:', function () {
      loader.load('abc.md', 'This is content.', {locals: {foo: true, options: {bar: true}}});
      loader.get('abc.md').locals.should.have.property('foo', true);
      loader.get('abc.md').locals.should.not.have.property('options');
    });

    it('should detect locals passed on the `locals` of the second arg', function () {
      loader.load('abc.md', {locals: {foo: true}, options: {bar: true}});
      loader.get('abc.md').locals.should.have.property('foo', true);
    });

    it('should detect locals passed on the `locals` of the first arg', function () {
      loader.load({path: 'abc.md', content: 'foo', locals: {foo: true}});
      loader.get('abc.md').locals.should.have.property('foo', true);
    });
  });
});
