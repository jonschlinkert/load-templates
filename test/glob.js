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
var utils = require('../lib/utils');


describe('.glob()', function () {
  it('should expand the given glob pattern and return an array of files', function () {
    var files = utils.glob('test/fixtures/*.md');
    files.length.should.equal(3);
  });
});

