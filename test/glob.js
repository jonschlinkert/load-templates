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


describe('.files()', function() {
  it('should read a filepath.', function () {
    var files = load.globSync('test/fixtures/a.txt', {a: 'b'});
    assert.equal(Array.isArray(files), true);
    files[0].should.have.property('content');
    files[0].should.have.property('data');
    files[0].content.toString().should.equal('AAA');
  });

  it('should read a glob of files.', function () {
    var files = load.globSync('test/fixtures/*.txt');
    assert.equal(Array.isArray(files), true);
    files[0].should.have.property('content');
    files[0].should.have.property('data');
    files[0].content.toString().should.equal('AAA');
    files[1].content.toString().should.equal('BBB');
    files[2].content.toString().should.equal('CCC');
  });
});
