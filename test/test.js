'use strict';

require('mocha');
require('should');
const File = require('vinyl');
const path = require('path');
const assert = require('assert');
const Loader = require('..');
const utils = require('../utils');
let loader;
let cache;

describe('load-templates', function() {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('invalid', function() {
    it('should throw an error when view type is invalid', function() {
      assert.throws(() => loader.createView(), TypeError);
      assert.throws(() => loader.createView(null), TypeError);
    });
  });

  describe('static .load method', function() {
    it('should load an object of vinyl files', function() {
      const views = Loader.load({
        a: new File({ path: 'test/fixtures/a.md', content: '...' }),
        b: new File({ path: 'test/fixtures/b.md', content: '...' }),
        c: new File({ path: 'test/fixtures/c.md', content: '...' })
      });

      const keys = Object.keys(views);
      assert.equal(keys.join(','), 'a,b,c');

      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof views[key], 'object');
        assert.equal(typeof views[key].path, 'string');
        assert.equal(typeof views[key].stat, 'object');
      });
    });
  });

  describe('string', function() {
    it('should load a template from a view path', function() {
      loader.load('test/fixtures/a.md');

      const keys = Object.keys(loader.cache);
      const key = keys[0];

      assert.equal(typeof loader.cache[key], 'object');
      assert.equal(typeof loader.cache[key].path, 'string');
      assert.equal(typeof loader.cache[key].stat, 'object');
    });

    it('should still load files when they do not exist', function() {
      const fixture = 'test/fixtures/flfofofofo.md';
      loader.load(fixture);
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      const key = keys[0];

      assert.equal(loader.cache[key].path, fixture);
    });

    it('should throw an error on invalid args', function() {
      assert.throws(() => loader.load(null), TypeError);
    });

    it('should do nothing when glob does not find files', function() {
      loader.load('sdfsjflsl/*.md');
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 0);
    });

    it('should load templates from a glob', function() {
      loader.load('test/fixtures/*.md');
      const keys = Object.keys(loader.cache);
      assert(keys.length >= 3);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load templates from an array of globs', function() {
      const views = loader.globViews(['test/fixtures/*.md']);
      const keys = Object.keys(loader.cache);
      assert(keys.length >= 3);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });
  });

  describe('array', function() {
    it('should load templates from an array of view paths', function() {
      loader.load(['test/fixtures/a.md', 'test/fixtures/b.md']);
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 2);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should use options with an array of view paths', function() {
      loader.load(['a.md', 'b.md'], { cwd: 'test/fixtures' });
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 2);

      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array of key-value view objects', function() {
      loader.load([{
        a: {path: 'test/fixtures/a.md'},
        b: {path: 'test/fixtures/b.md'},
        c: {path: 'test/fixtures/c.md'}
      }]);

      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 3);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an array with multiple key-value view objects', function() {
      loader.load([
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
      loader.load([
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

    it('should create a view from a vinyl view', function() {
      const view = loader.createView('foo', new File({ path: 'test/fixtures/a.md' }));
      assert(File.isVinyl(view));
      assert.equal(view.path, 'test/fixtures/a.md');
    });

    it('should use path from first argument', function() {
      const view = loader.createView('foo', { content: '...' });
      assert(File.isVinyl(view));
      assert.equal(view.path, 'foo');
    });

    it('should load a view from a key-value pair', function() {
      loader.load('foo', { path: 'test/fixtures/a.md' });
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load a view from an object', function() {
      loader.load({ 'foo/bar.md': { content: 'this is content.', data: { a: 'a' } } });
      const keys = Object.keys(loader.cache);
      assert.equal(keys.length, 1);
      keys.forEach(function(key) {
        assert.equal(typeof loader.cache[key], 'object');
        assert.equal(typeof loader.cache[key].path, 'string');
        assert.equal(typeof loader.cache[key].stat, 'object');
      });
    });

    it('should load an object of views', function() {
      loader.load({
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

    it('should load an object of vinyl files', function() {
      loader.load({
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
    it('should use constructor options', function() {
      loader = new Loader({cwd: 'test/fixtures'});
      loader.load('*.txt');
      assert.equal(Object.keys(loader.cache).length, 3);
    });

    describe('options.cwd', function() {
      it('should pass cwd option to matched', function() {
        loader.load('*.md', {cwd: 'test/fixtures'});
        const keys = Object.keys(loader.cache);
        assert(keys.length >= 1);
        keys.forEach(function(key) {
          assert.equal(typeof loader.cache[key], 'object');
          assert.equal(typeof loader.cache[key].path, 'string');
          assert.equal(typeof loader.cache[key].stat, 'object');
        });
      });
    });

    describe('options.onLoad', function() {
      it('should take a loader function on the options', function() {
        loader.options.onLoad = function(view) {
          view.locals = { foo: 'bar' };
        };

        const fixture = 'test/fixtures/a.txt';
        loader.load(fixture);
        const view = loader.cache[fixture];
        assert.equal(view.locals.foo, 'bar');
      });
    });

    describe('options.renameKey', function() {
      it('should use view.key when view.path is not defined', function() {
        const key = utils.renameKey({ isView: true, key: 'foo' });
        assert.equal(key, 'foo');
      });

      it('should use view.path when view.key is not defined', function() {
        const key = utils.renameKey({ isView: true, path: 'foo' });
        assert.equal(key, 'foo');
      });

      it('should support custom renameKey functions on global options', function() {
        loader = new Loader({ renameKey: view => view.relative });
        loader.load('test/fixtures/a.md');

        assert.equal(typeof loader.cache['test/fixtures/a.md'], 'object');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].path, 'string');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].stat, 'object');
      });

      it('should support custom renameKey functions', function() {
        loader.load('test/fixtures/a.md', { renameKey: view => view.relative });

        assert.equal(typeof loader.cache['test/fixtures/a.md'], 'object');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].path, 'string');
        assert.equal(typeof loader.cache['test/fixtures/a.md'].stat, 'object');

        loader.load('test/fixtures/*.txt', { renameKey: view => view.stem });

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
  });
});
