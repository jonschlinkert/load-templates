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


describe('when templates are formatted as arrays', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should load templates from an array glob pattern', function () {
    loader.load(['test/fixtures/*.txt'], true);

    loader.cache.should.be.an.object;
    loader.get('a.txt').should.have.property('path');
    loader.get('a.txt').should.have.property('data');
    loader.get('a.txt').should.have.property('content');
  });

  it('should normalize locals passed as a second param', function () {
    loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);

    loader.cache.should.be.an.object;
    loader.get('a.txt').should.have.property('locals');
    loader.get('a.txt').locals.name.should.equal('Brian Woodward');
  });

  it('should create a path property from the filepath.', function () {
    loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);

    loader.cache.should.be.an.object;
    loader.get('a.txt').should.have.property('path');
  });
});
