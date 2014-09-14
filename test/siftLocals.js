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


describe('.siftLocals()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should return locals that are passed directly.', function () {
    var locals = loader.siftLocals('test/fixtures/*.txt', 'abc', {a: 'b'});
    locals.should.have.property('a', 'b');
  });

  it('should omit `options` from the locals object.', function () {
    var locals = loader.siftLocals('test/fixtures/*.txt', 'abc', {a: 'b', options: {}});
    locals.should.have.property('a', 'b');
    locals.should.not.have.property('options');
  });

  it('should return locals passed on the `value` object.', function () {
    var locals = loader.siftLocals('test/fixtures/*.txt', {locals: {c: 'd'}});
    locals.should.have.property('c', 'd');
  });

  it('should return locals passed on the `key` object.', function () {
    var locals = loader.siftLocals({locals: {e: 'f'}});
    locals.should.have.property('e', 'f');
  });

  it('should return locals nested on the `key` object.', function () {
    var locals = loader.siftLocals({'a/b/c.md': {locals: {g: 'h'}}});
    locals.should.have.property('g', 'h');
  });
});
