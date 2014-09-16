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


describe('when a glob pattern is passed.', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should load multiple templates from objects:', function () {
    loader.load('test/fixtures/three/*.md', {name: 'Brian Woodward'});
    loader.get('g.md').should.have.property('data', {title: 'G'})
  });
});
