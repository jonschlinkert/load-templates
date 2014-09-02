/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var loader = require('..');

var fixture = function(filepath) {
  return path.join(__dirname, 'fixtures/' + filepath)
    .replace(/[\\\/]/g, '/');
};


describe('loader', function () {
  it('should use cwd:', function () {
    loader({cwd: 'test/fixtures'});
    loader.options.cwd.should.equal('test/fixtures');
  });

  describe('string', function () {
    it('should load templates from a string glob pattern', function () {
      var actual = loader.load('pages/*.txt');
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('path');
      actual[key].should.have.property('data');
      actual[key].should.have.property('content');
    });

    it('should normalize data passed as a second param', function () {
      var actual = loader.load('pages/*.txt', {name: 'Brian Woodward'});
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('data');
      actual[key].data.name.should.equal('Brian Woodward');
    });

    it('should create a path property from the filepath.', function () {
      var actual = loader.load('pages/*.txt', {name: 'Brian Woodward'});
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('path');
      actual[key].path.should.equal(key);
    });

    it('should normalize content passed as a second param', function () {
      var actual = loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      var key = 'abc.md';

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('data');
      actual[key].content.should.equal('This is content.');
      actual[key].data.name.should.equal('Jon Schlinkert');
    });

    it('should normalize data passed as a second param', function () {
      var actual = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('data');
      actual[key].data.name.should.equal('Brian Woodward');
    });
  });

  describe('array', function () {
    it('should load templates from an array glob pattern', function () {
      var actual = loader.load(['pages/*.txt']);
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('path');
      actual[key].should.have.property('data');
      actual[key].should.have.property('content');
    });

    it('should normalize data passed as a second param', function () {
      var actual = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('data');
      actual[key].data.name.should.equal('Brian Woodward');
    });

    it('should create a path property from the filepath.', function () {
      var actual = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
      var key = fixture('pages/a.txt');

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('path');
      actual[key].path.should.equal(key);
    });
  });

  describe('object', function () {
    it('should load templates from an object', function () {
      var actual = loader.load({'foo/bar.md': {content: 'this is content.'}});
      var key = 'foo/bar.md';

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('path');
      actual[key].should.have.property('data');
      actual[key].should.have.property('content');
    });

    it('should normalize data passed as a second param', function () {
      var actual = loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});
      var key = 'foo/bar.md';

      actual.should.be.an.object;
      actual.should.have.property(key);
      actual[key].should.have.property('data');
      actual[key].data.should.eql({foo: 'bar'});
    });
  });
});
