'use strict';

require('mocha');
require('should');
var path = require('path');
var assert = require('assert');
var glob = require('matched');
var Loader = require('..');
var loader;
var cache;

describe('load-templates', function() {
  describe('cache', function() {
    it('should allow a custom cache to be used:', function() {
      cache = {};
      loader = new Loader({cache: cache});
      loader.addView('foo', {path: 'bar'});
      assert.equal(typeof cache[path.resolve('foo')], 'object');
      assert.equal(typeof cache[path.resolve('foo')].path, 'string');
    });

    it('should cache views on the default cache:', function() {
      loader = new Loader();
      loader.addView('foo', {path: 'bar'});

      assert.equal(typeof loader.cache[path.resolve('foo')], 'object');
      assert.equal(typeof loader.cache[path.resolve('foo')].path, 'string');
    });
  });

  describe('config', function() {
    it('should support cwd on options', function() {
      loader = new Loader({cwd: 'test/fixtures'});
      loader.load('*.txt');
      assert.equal(Object.keys(loader.cache).length, 3);
    });
  });

  describe('string', function() {
    beforeEach(function() {
      loader = new Loader();
    });

    it('should load a template from a file path:', function() {
      loader.load('test/fixtures/a.md');

      var keys = Object.keys(loader.cache);
      var key = keys[0];

      assert.equal(typeof loader.cache[key], 'object');
      assert.equal(typeof loader.cache[key].path, 'string');
      assert.equal(typeof loader.cache[key].stat, 'object');
    });

    it('should still load files when they do not exist:', function() {
      var fixture = 'test/fixtures/flfofofofo.md';
      loader.load(fixture);
      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      var key = keys[0];

      assert.equal(loader.cache[key].path, path.resolve(fixture));
    });

    it('should not choke on invalid args:', function() {
      loader.load(null);
      assert.deepEqual(loader.cache, {});
    });

    it('should take a loader function on the options', function() {
      loader.options.loaderFn = function(file) {
        file.locals = {foo: 'bar'};
      };

      var fixture = 'test/fixtures/a.txt';
      loader.load(fixture);
      var file = loader.cache[path.resolve(fixture)];
      assert.equal(file.locals.foo, 'bar');
    });

    it('should load templates from a glob:', function() {
      loader.load('test/fixtures/*.md');
      var keys = Object.keys(loader.cache);
      assert(keys.length >= 3);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });
  });

  describe('array', function() {
    beforeEach(function() {
      loader = new Loader();
    });

    it('should load templates from an array of file paths:', function() {
      loader.load(['test/fixtures/a.md', 'test/fixtures/b.md']);
      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 2);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should use options with an array of file paths:', function() {
      loader.load(['a.md', 'b.md'], {cwd: 'test/fixtures'});
      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 2);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });
  });

  describe('object', function() {
    beforeEach(function() {
      loader = new Loader();
    });

    it('should load a template from a key-value pair:', function() {
      loader.load('foo', {path: 'test/fixtures/a.md'});
      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an object of views:', function() {
      loader.load({
        a: {path: 'test/fixtures/a.md'},
        b: {path: 'test/fixtures/b.md'},
        c: {path: 'test/fixtures/c.md'},
      });

      var keys = Object.keys(loader.cache);
      assert.equal(keys.join(','), 'a,b,c');

      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });
  });

  describe('array', function() {
    beforeEach(function() {
      loader = new Loader();
    });

    it('should load an array of key-value view objects:', function() {
      loader.load([{
        a: {path: 'test/fixtures/a.md'},
        b: {path: 'test/fixtures/b.md'},
        c: {path: 'test/fixtures/c.md'},
      }]);

      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array with multiple key-value view objects:', function() {
      loader.load([
        {
          a: {path: 'test/fixtures/a.md'},
          b: {path: 'test/fixtures/b.md'},
          c: {path: 'test/fixtures/c.md'},
        },
        {
          d: {path: 'test/fixtures/d.md'},
          e: {path: 'test/fixtures/e.md'},
          f: {path: 'test/fixtures/f.md'},
        }
      ]);

      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 6);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array of view objects:', function() {
      loader.load([
        {path: 'test/fixtures/a.md'},
        {path: 'test/fixtures/b.md'},
        {path: 'test/fixtures/c.md'},
      ]);

      var keys = Object.keys(loader.cache);
      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });
  });

  describe('options', function() {
    beforeEach(function() {
      loader = new Loader();
    });

    describe('options.renameKey', function() {
      it('should support custom renameKey functions on global options:', function() {
        loader = new Loader({
          renameKey: function(key, file) {
            return file.relative;
          }
        });

        loader.load('test/fixtures/a.md');

        assert.equal(typeof loader.cache['test/fixtures/a.md'], 'object');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].path, 'string');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].stat, 'object');
      });

      it('should support custom renameKey functions:', function() {
        loader.load('test/fixtures/a.md', {
          renameKey: function(key, file) {
            return file.relative;
          }
        });

        assert.equal(typeof loader.cache['test/fixtures/a.md'], 'object');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].path, 'string');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].stat, 'object');

        loader.load('test/fixtures/*.txt', {
          renameKey: function(key, file) {
            return file.stem;
          }
        });

        assert.equal(typeof loader.cache.a, 'object');
        assert.equal(typeof loader.cache.a.path, 'string');
        assert.equal(typeof loader.cache.a.stat, 'object');

        assert.equal(typeof loader.cache.b, 'object');
        assert.equal(typeof loader.cache.b.path, 'string');
        assert.equal(typeof loader.cache.b.stat, 'object');

        assert.equal(typeof loader.cache.c, 'object');
        assert.equal(typeof loader.cache.c.path, 'string');
        assert.equal(typeof loader.cache.c.stat, 'object');
      });
    });

    describe('options.cwd', function() {
      it('should pass cwd option to matched:', function() {
        loader.load('*.md', {cwd: 'test/fixtures'});
        var keys = Object.keys(loader.cache);
        assert(keys.length >= 1);
        keys.forEach(function(key) {
          assert.equal(typeof loader.cache[key], 'object');
          assert.equal(typeof loader.cache[key].path, 'string');
          assert.equal(typeof loader.cache[key].stat, 'object');
        });
      });
    });
  });
});
