'use strict';

require('mocha');
require('should');
const File = require('vinyl');
const path = require('path');
const assert = require('assert');
const Loader = require('..');
let loader;
let cache;

describe('.addViews', function() {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('string', function() {
    it('should load a template from a file path', function() {
      loader.addViews('test/fixtures/a.md');

      const keys = Object.keys(loader.cache);
      const key = keys[0];

      assert.equal(typeof loader.cache[key], 'object');
      assert.equal(typeof loader.cache[key].path, 'string');
      assert.equal(typeof loader.cache[key].stat, 'object');
    });

    it('should still load files when they do not exist', function() {
      const fixture = 'test/fixtures/flfofofofo.md';
      loader.addViews(fixture);
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      const key = keys[0];

      assert.equal(loader.cache[key].path, fixture);
    });

    it('should throw an error on invalid args', function() {
      assert.throws(() => loader.addViews(null), TypeError);
    });

    it('should take a loader function on the options', function() {
      loader.options.onLoad = function(file) {
        file.locals = { foo: 'bar' };
      };

      const fixture = 'test/fixtures/a.txt';
      loader.addViews(fixture);

      const file = loader.cache[fixture];
      assert.equal(file.locals.foo, 'bar');
    });
  });

  describe('array', function() {
    it('should load templates from an array of file paths', function() {
      loader.addViews(['test/fixtures/a.md', 'test/fixtures/b.md']);
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 2);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should use options with an array of file paths', function() {
      loader.addViews(['a.md', 'b.md'], { cwd: 'test/fixtures' });
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 2);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array of key-value view objects', function() {
      loader.addViews([
        {
          a: { path: 'test/fixtures/a.md' },
          b: { path: 'test/fixtures/b.md' },
          c: { path: 'test/fixtures/c.md' }
        }
      ]);

      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array with multiple key-value view objects', function() {
      loader.addViews([
        {
          a: {path: 'test/fixtures/a.md'},
          b: {path: 'test/fixtures/b.md'},
          c: {path: 'test/fixtures/c.md'}
        },
        {
          d: {path: 'test/fixtures/d.md'},
          e: {path: 'test/fixtures/e.md'},
          f: {path: 'test/fixtures/f.md'}
        }
      ]);

      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 6);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array of view objects', function() {
      loader.addViews([
        {path: 'test/fixtures/a.md'},
        {path: 'test/fixtures/b.md'},
        {path: 'test/fixtures/c.md'}
      ]);

      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 3);
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

    it('should load a template from a key-value pair', function() {
      loader.addViews('foo', { path: 'test/fixtures/a.md' });
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an object of view objects', function() {
      loader.addViews({
        a: { path: 'test/fixtures/a.md', content: '...' },
        b: { path: 'test/fixtures/b.md', content: '...' },
        c: { path: 'test/fixtures/c.md', content: '...' }
      });

      const keys = Object.keys(loader.cache);
      assert.equal(keys.join(','), 'a,b,c');

      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an object of paths', function() {
      loader.addViews({
        a: 'test/fixtures/a.md',
        b: 'test/fixtures/b.md',
        c: 'test/fixtures/c.md'
      });

      const keys = Object.keys(loader.cache);
      assert.equal(keys.join(','), 'a,b,c');

      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should throw an error when view type is invalid', function() {
      assert.throws(function() {
        loader.addViews({a: () => {}, b: () => {}, c: () => {}});
      }, TypeError);
    });

    it('should load an object of vinyl files', function() {
      loader.addViews({
        a: new File({ path: 'test/fixtures/a.md', content: '...' }),
        b: new File({ path: 'test/fixtures/b.md', content: '...' }),
        c: new File({ path: 'test/fixtures/c.md', content: '...' })
      });

      const keys = Object.keys(loader.cache);
      assert.equal(keys.join(','), 'a,b,c');

      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });
  });

  describe('options', function() {
    describe('options.renameKey', function() {
      it('should support custom renameKey functions on global options', function() {
        loader = new Loader({ renameKey: file => file.relative });
        loader.addViews('test/fixtures/a.md');

        assert.equal(typeof loader.cache['test/fixtures/a.md'], 'object');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].path, 'string');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].stat, 'object');
      });

      it('2should support custom renameKey functions', function() {
        loader.addViews('test/fixtures/a.md', { renameKey: file => file.relative });

        assert.equal(typeof loader.cache['test/fixtures/a.md'], 'object');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].path, 'string');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].stat, 'object');
      });
    });

    describe('options.cwd', function() {
      it('should pass cwd option to matched', function() {
        loader.addViews('*.md', {cwd: 'test/fixtures'});
        const keys = Object.keys(loader.cache);
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
