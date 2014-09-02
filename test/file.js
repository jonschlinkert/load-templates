/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var assert = require('assert');
var should = require('should');
var load = require('..');


describe('.file()', function() {
  it('should read a filepath.', function () {
    var file = load.fileSync('test/fixtures/a.txt');
    assert.equal(typeof file, 'object');
    assert.equal(!Array.isArray(file), true);
    file.should.have.property('content');
    file.should.have.property('data');
    file.content.toString().should.equal('AAA');
  });
});
