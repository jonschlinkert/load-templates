/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var Loader = require('..');
var loader;


describe('.glob()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should expand the given glob pattern and return an array of files', function () {
    var files = loader.glob('test/fixtures/*.md');
    files.length.should.equal(3);
  });
});

