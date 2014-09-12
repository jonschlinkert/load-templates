/*!
 * loader <https://github.com/jonschlinkert/loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var assert = require('assert');
var loader = require('./');
var _ = require('lodash');


describe('load single templates', function () {
  describe('.load() strings', function () {
    it('should load a template string.', function () {
      var files = loader.load('a.md', 'b');
      files.get('a.md').should.have.property('content');
      files.get('a.md').content.should.equal('b');
    });

    it('should load a template string.', function () {
      var files = loader.load('a.md', {content: 'c'});
      files.get('a.md').content.should.equal('c');
    });

    it('should load a template string.', function () {
      var files = loader.load('a.md', {content: 'c'});
      files.get('a.md').content.should.equal('c');
    });
  });
});
