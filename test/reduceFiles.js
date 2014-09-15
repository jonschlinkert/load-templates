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


describe('.reduceFiles()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should return an object of parsed file objects.', function () {
    var files = loader.reduceFiles('test/fixtures/*.md');
    files.should.have.property('a.md');
    files.should.have.property('b.md');
    files.should.have.property('c.md');
  });

  it('should add the objects to the cache.', function () {
    loader.reduceFiles('test/fixtures/*.md');

    loader.cache.should.have.property('a.md');
    loader.cache.should.have.property('b.md');
    loader.cache.should.have.property('c.md');
  });

  it('should add the objects to the cache.', function () {
    loader.reduceFiles('test/fixtures/*.md');
    assert.equal(!!loader.get('a.md'), true);
    assert.equal(!!loader.get('b.md'), true);
    assert.equal(!!loader.get('c.md'), true);
  });

  it('should add a the file path of each file to the `path` property.', function () {
    loader.reduceFiles('test/fixtures/*.md');
    loader.get('a.md').path.should.equal('test/fixtures/a.md');
    loader.get('b.md').path.should.equal('test/fixtures/b.md');
    loader.get('c.md').path.should.equal('test/fixtures/c.md');
  });

  it('should add `data` for each file if it exists.', function () {
    loader.reduceFiles('test/fixtures/*.md');
    loader.get('a.md').data.should.have.property('title', 'AAA');
    loader.get('b.md').data.should.have.property('title', 'BBB');
    loader.get('c.md').data.should.have.property('title', 'CCC');
  });

  it('should add a `content` property if content exists.', function () {
    loader.reduceFiles('test/fixtures/*.md');
    loader.get('a.md').should.have.property('content', 'This is fixture a.md');
    loader.get('b.md').should.have.property('content', 'This is fixture b.md');
    loader.get('c.md').should.have.property('content', 'This is fixture c.md');
  });
});

