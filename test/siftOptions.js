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


describe('.siftOptions()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should return options that are passed directly.', function () {
    var options = loader.siftOptions('test/fixtures/*.txt', 'abc', {a: 'b'}, {optA: 'a'});
    options.should.have.property('optA', 'a');
  });

  it('should return options passed on the `locals`.', function () {
    var options = loader.siftOptions('test/fixtures/*.txt', 'abc', {a: 'b', options: {optB: 'b'}});
    options.should.have.property('optB', 'b');
    options.should.not.have.property('options');
  });

  it('should return options that are passed on the `value` object.', function () {
    var options = loader.siftOptions('test/fixtures/*.txt', {options: {optC: 'd'}});
    options.should.have.property('optC', 'd');
  });

  it('should return options that are passed on the `key` object.', function () {
    var options = loader.siftOptions({options: {optE: 'f'}});
    options.should.have.property('optE', 'f');
  });

  it('should return options nested on the `key` object.', function () {
    var options = loader.siftOptions({'a/b/c.md': {options: {optG: 'h'}}});
    options.should.have.property('optG', 'h');
  });
});
