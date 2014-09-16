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


describe('.findLocals()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should return an empty object when no arguments are passed.', function () {
    var locals = loader.findLocals();
    locals.should.eql({});
  });

  it('should return locals that are passed directly.', function () {
    var locals = loader.findLocals(['test/fixtures/*.txt', 'abc', {a: 'b'}]);
    locals.should.have.property('a', 'b');
  });

  it('should not return locals defined after the given index (second arg).', function () {
    var locals = loader.findLocals(['test/fixtures/*.txt', 'abc', {a: 'b'}, {locals: {c: 'd'}}]);
    locals.should.have.property('a', 'b');
    locals.should.not.have.property('c');
  });

  it('should automatically omit `options` from the locals object.', function () {
    var locals = loader.findLocals(['test/fixtures/*.txt', 'abc', {a: 'b', options: {}}]);
    locals.should.have.property('a', 'b');
    locals.should.not.have.property('options');
  });

  it('should omit a given property, `foo` from the locals object.', function () {
    var locals = loader.findLocals(['test/fixtures/*.txt', 'abc', {a: 'b', foo: 'bar', options: {}}], ['foo']);
    locals.should.have.property('a', 'b');
    locals.should.not.have.property('options');
    locals.should.not.have.property('foo');
  });

  it('should return locals passed on the `value` object.', function () {
    var locals = loader.findLocals(['test/fixtures/*.txt', {locals: {c: 'd'}}]);
    locals.should.have.property('c', 'd');
  });

  it('should return locals passed on the `key` object.', function () {
    var locals = loader.findLocals([{locals: {e: 'f'}}]);
    locals.should.have.property('e', 'f');
  });

  it('should return locals nested on the `key` object.', function () {
    var locals = loader.findLocals([{'a/b/c.md': {locals: {g: 'h'}}}]);
    locals.should.have.property('g', 'h');
  });
});

describe('.aggregate() locals', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should return an empty object when no arguments are passed.', function () {
    var locals = loader.aggregate('locals', 2);
    locals.should.eql({});
  });

  it('should return locals that are passed directly.', function () {
    var locals = loader.aggregate('locals', 2, ['test/fixtures/*.txt', 'abc', {a: 'b'}]);
    locals.should.have.property('a', 'b');
  });

  it('should not return locals defined after the given index (second arg).', function () {
    var locals = loader.aggregate('locals', 2, ['test/fixtures/*.txt', 'abc', {a: 'b'}, {locals: {c: 'd'}}]);
    locals.should.have.property('a', 'b');
    locals.should.not.have.property('c');
  });

  it('should omit `options` from the locals object.', function () {
    var locals = loader.aggregate('locals', 2, ['test/fixtures/*.txt', 'abc', {a: 'b', options: {}}], ['options']);
    locals.should.have.property('a', 'b');
    locals.should.not.have.property('options');
  });

  it('should return locals passed on the `value` object.', function () {
    var locals = loader.aggregate('locals', 2, ['test/fixtures/*.txt', {locals: {c: 'd'}}]);
    locals.should.have.property('c', 'd');
  });

  it('should return locals passed on the `key` object.', function () {
    var locals = loader.aggregate('locals', 2, [{locals: {e: 'f'}}]);
    locals.should.have.property('e', 'f');
  });

  it('should return locals nested on the `key` object.', function () {
    var locals = loader.aggregate('locals', 2, [{'a/b/c.md': {locals: {g: 'h'}}}]);
    locals.should.have.property('g', 'h');
  });
});
