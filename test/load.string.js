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


describe('when templates are formatted as strings', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('load individual templates', function () {
    it('should detect content when passed as a second param', function () {
      loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      loader.get('abc.md').should.have.property('content', 'This is content.');
    });

    it('should detect locals when passed as a second param', function () {
      loader.load('whatever', {name: 'Brian Woodward'});
      loader.get('whatever').should.have.property('locals', {name: 'Brian Woodward'});
    });

    it('should return `{content: null}` when content is not defined or detected.', function () {
      loader.load('whatever', {name: 'Brian Woodward'});
      loader.get('whatever').should.have.property('content', null);
    });
  });

  describe('when the key is a non-filepath, non-glob string:', function () {
    it('should load even if the key is an invalid filepath.', function () {
      loader.load('a.md');
      loader.cache.should.have.property('a.md');
    });

    it('should load even if the key is an invalid filepath.', function () {
      loader.load('a.md', 'b');
      loader.get('a.md').should.have.property('content', 'b');
    });

    it('should load when content is a property on an object.', function () {
      loader.load('a.md', {content: 'c'});
      loader.get('a.md').should.have.property('content', 'c');
    });

    it('should load templates onto the cache:', function () {
      loader.load('a.md', {content: 'c'});
      loader.cache['a.md'].should.have.property('content', 'c');
    });

    it('should normalize content passed as a second param', function () {
      loader.load('foo/bar/abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      loader.cache.should.be.an.object;
      loader.get('abc.md').should.have.property('locals');
      loader.get('abc.md').content.should.equal('This is content.');
      loader.get('abc.md').locals.name.should.equal('Jon Schlinkert');
    });

    describe('when the second arg is a string:', function () {
      it('should use the first are', function () {
        loader.load('a', 'A above\n{{body}}\nA below', {layout: 'b'});
        loader.load('b', 'B above\n{{body}}\nB below', {layout: 'c'});
        loader.load('c', 'C above\n{{body}}\nC below', {layout: 'd'});

        loader.cache.should.have.property('a');
        loader.cache.a.content.should.equal('A above\n{{body}}\nA below');
        loader.cache.a.locals.should.have.property('layout');
        loader.cache.should.have.property('b');
        loader.cache.b.locals.should.have.property('layout');
        loader.cache.should.have.property('c');
        loader.cache.c.locals.should.have.property('layout');
      });
    });

    describe('when the second arg is an object:', function () {
      it('should use the first arg as the key.', function () {
        loader.load('a', {content: 'A above\n{{body}}\nA below', layout: 'b'});
        loader.load('b', {content: 'B above\n{{body}}\nB below', layout: 'c'});
        loader.load('c', {content: 'C above\n{{body}}\nC below', layout: 'd'});

        loader.cache.should.have.property('a');
        loader.cache.a.content.should.equal('A above\n{{body}}\nA below');
        loader.cache.a.locals.should.have.property('layout');
        loader.cache.should.have.property('b');
        loader.cache.b.locals.should.have.property('layout');
        loader.cache.should.have.property('c');
        loader.cache.c.locals.should.have.property('layout');
      });
    });
  });

  describe('load multiple templates:', function () {
    it('should load the template onto the cache:', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.cache.should.be.an.object;
      loader.cache['a.txt'].should.exist;
    });

    it('should detect locals passed as a second param', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.get('a.txt').should.have.property('locals');
      loader.get('a.txt').locals.should.have.property('name', 'Brian Woodward');
    });

    it('should create the `path` property from the filepath.', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.get('a.txt').should.have.property('path', 'test/fixtures/a.txt');
    });

    it('should get front-matter from files:', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.get('a.txt').should.have.property('data', {title: 'AAA'});
    });

    it('should load templates from a string glob pattern', function () {
      loader.load('test/fixtures/*.txt', true);

      loader.cache.should.be.an.object;
      loader.cache['a.txt'].should.have.property('path', 'test/fixtures/a.txt');
      loader.cache['a.txt'].should.have.property('data', {title: 'AAA'});
      loader.cache['a.txt'].should.have.property('locals', {});
      loader.cache['a.txt'].should.have.property('content', 'This is fixture a.txt');
    });

    describe('when the key is a glob pattern:', function () {
      it('should load when the key is a filepath.', function () {
        loader.load('test/fixtures/*.md', true);
        loader.get('a.md').should.have.property('path', 'test/fixtures/a.md');
        loader.get('a.md').should.have.property('content', 'This is fixture a.md');
      });

      it('should load templates from a string glob pattern', function () {
        loader.load('test/fixtures/**/*.{txt,md}', true);
        loader.should.be.an.object;
      });

      it('should normalize data passed as a second param', function () {
        loader.load('test/fixtures/*.txt', {name: 'Brian Woodward', a: 'b'}, true);
        loader.cache.should.be.an.object;
        loader.get('a.txt').should.have.property('data');
        loader.get('a.txt').locals.name.should.equal('Brian Woodward');
      });

      it('should create a path property from the filepath.', function () {
        loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
        loader.cache.should.be.an.object;
        loader.get('a.txt').should.have.property('path');
      });

      it('should normalize locals passed as a second param', function () {
        loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);
        loader.cache.should.be.an.object;
        loader.get('a.txt').should.have.property('locals');
        loader.get('a.txt').locals.name.should.equal('Brian Woodward');
      });
    });

    it('should detect locals passed as a second param', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.get('a.txt').should.have.property('locals');
      loader.get('a.txt').locals.should.have.property('name', 'Brian Woodward');
    });

    it('should create the `path` property from the filepath.', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.get('a.txt').should.have.property('path', 'test/fixtures/a.txt');
    });

    it('should get front-matter from files:', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.get('a.txt').should.have.property('data', {title: 'AAA'});
    });

    // it.only('should detect locals when passed as a second param', function () {
    //   loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);
    //   loader.get('abc.md').should.have.property('locals', {name: 'Brian Woodward'});
    // });
  });
});
