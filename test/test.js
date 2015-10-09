require('mocha');
require('should');
var path = require('path');
var assert = require('assert');
var glob = require('matched');
var loader = require('../');

describe('cache', function () {
  it('should allow a custom cache to be used:', function () {
    var cache = {};
    var views = loader(cache);
    views('foo', {path: 'bar'});
    assert(typeof cache.foo === 'object');
    assert(typeof cache.foo.path === 'string');
  });

  it('should cache views on the default cache:', function () {
    var views = loader();
    var cache = views('foo', {path: 'bar'});
    assert(typeof cache.foo === 'object');
    assert(typeof cache.foo.path === 'string');
  });
});

describe('config', function () {
  it('should support passing a config object as the second arg:', function () {
    var cache = {};
    var views = loader(cache, {cwd: 'test/fixtures'});
    views('*.txt');
    assert(Object.keys(cache).length === 3);
  });
});

describe('string', function () {
  it('should load a template from a file path:', function () {
    var cache = {};
    var views = loader(cache);
    views('test/fixtures/a.md');
    assert(typeof cache['test/fixtures/a.md'] === 'object');
    assert(typeof cache['test/fixtures/a.md'].path === 'string');
    assert(typeof cache['test/fixtures/a.md'].stat === 'object');
  });

  it('should fail gracefully:', function () {
    var cache = {};
    var views = loader(cache);
    views('test/fixtures/flfofofofo.md');
    assert.deepEqual(cache, {});
  });

  it('should return an empty object on invalid args:', function () {
    var cache = {};
    var views = loader(cache);
    views(null);
    assert.deepEqual(cache, {});
  });

  it('should take a sync callback on the loader function:', function () {
    var views = loader(function (file) {
      file.locals = {foo: 'bar'};
    });
    var cache = views('test/fixtures/a.txt');
    assert(cache['test/fixtures/a.txt'].locals.foo = 'bar');
  });

  it('should take a sync callback and custom cache object:', function () {
    var cache = {};
    var views = loader(cache, function (file) {
      file.locals = {foo: 'bar'};
    });
    views('test/fixtures/a.txt');
    assert(cache['test/fixtures/a.txt'].locals.foo = 'bar');
  });

  it('should load templates from a glob:', function () {
    var cache = {};
    var views = loader(cache);
    views('test/fixtures/*.md');
    assert(typeof cache['test/fixtures/a.md'] === 'object');
    assert(typeof cache['test/fixtures/a.md'].path === 'string');
    assert(typeof cache['test/fixtures/a.md'].stat === 'object');
    assert(typeof cache['test/fixtures/b.md'] === 'object');
    assert(typeof cache['test/fixtures/b.md'].path === 'string');
    assert(typeof cache['test/fixtures/b.md'].stat === 'object');
    assert(typeof cache['test/fixtures/c.md'] === 'object');
    assert(typeof cache['test/fixtures/c.md'].path === 'string');
    assert(typeof cache['test/fixtures/c.md'].stat === 'object');
  });
});

describe('array', function () {
  it('should load templates from an array of file paths:', function () {
    var cache = {};
    var views = loader(cache);
    views(['test/fixtures/a.md', 'test/fixtures/b.md']);
    assert(typeof cache['test/fixtures/a.md'] === 'object');
    assert(typeof cache['test/fixtures/a.md'].path === 'string');
    assert(typeof cache['test/fixtures/a.md'].stat === 'object');

    assert(typeof cache['test/fixtures/b.md'] === 'object');
    assert(typeof cache['test/fixtures/b.md'].path === 'string');
    assert(typeof cache['test/fixtures/b.md'].stat === 'object');
  });

  it('should use options with an array of file paths:', function () {
    var cache = {};
    var views = loader(cache);
    views(['a.md', 'b.md'], {cwd: 'test/fixtures'});
    assert(typeof cache['test/fixtures/a.md'] === 'object');
    assert(typeof cache['test/fixtures/a.md'].path === 'string');
    assert(typeof cache['test/fixtures/a.md'].stat === 'object');

    assert(typeof cache['test/fixtures/b.md'] === 'object');
    assert(typeof cache['test/fixtures/b.md'].path === 'string');
    assert(typeof cache['test/fixtures/b.md'].stat === 'object');
  });
});

describe('object', function () {
  it('should load a template from a key-value pair:', function () {
    var cache = {};
    var views = loader(cache);
    views('a', {path: 'test/fixtures/a.md'});
    assert(typeof cache.a === 'object');
    assert(typeof cache.a.path === 'string');
  });

  it('should load an object of views:', function () {
    var cache = {};
    var views = loader(cache);
    views({
      a: {path: 'test/fixtures/a.md'},
      b: {path: 'test/fixtures/b.md'},
      c: {path: 'test/fixtures/c.md'},
    });
    assert(typeof cache.a === 'object');
    assert(typeof cache.b === 'object');
    assert(typeof cache.c === 'object');
    assert(typeof cache.a.path === 'string');
    assert(typeof cache.b.path === 'string');
    assert(typeof cache.c.path === 'string');
  });
});

describe('array', function () {
  it('should load an array of views:', function () {
    var cache = {};
    var views = loader(cache);

    views([{
      a: {path: 'test/fixtures/a.md'},
      b: {path: 'test/fixtures/b.md'},
      c: {path: 'test/fixtures/c.md'},
    }]);

    assert(typeof cache.a === 'object');
    assert(typeof cache.b === 'object');
    assert(typeof cache.c === 'object');
    assert(typeof cache.a.path === 'string');
    assert(typeof cache.b.path === 'string');
    assert(typeof cache.c.path === 'string');
  });
});

describe('options', function () {
  describe('options.renameKey', function () {
    it('should support custom renameKey functions:', function () {
      var cache = {};
      var views = loader(cache);
      views('test/fixtures/*.md', {
        renameKey: function (key) {
          return key;
        }
      });

      views('test/fixtures/*.txt', {
        renameKey: function (key) {
          return path.basename(key, path.extname(key));
        }
      });

      assert(typeof cache['test/fixtures/a.md'] === 'object');
      assert(typeof cache['test/fixtures/a.md'].path === 'string');
      assert(typeof cache['test/fixtures/a.md'].stat === 'object');

      assert(typeof cache.a === 'object');
      assert(typeof cache.a.path === 'string');
      assert(typeof cache.a.stat === 'object');
    });
  });

  describe('options.cwd', function () {
    it('should pass cwd option to matched:', function () {
      var cache = {};
      var views = loader(cache);
      views('*.md', {
        cwd: 'test/fixtures'
      });
      assert(typeof cache['test/fixtures/a.md'] === 'object');
      assert(typeof cache['test/fixtures/a.md'].path === 'string');
      assert(typeof cache['test/fixtures/a.md'].stat === 'object');
    });

    it('should allow a custom glob function to be passed:', function () {
      var cache = {};
      var views = loader(cache, {glob: glob});
      views('*.md', {cwd: 'test/fixtures'});
      assert(typeof cache['test/fixtures/a.md'] === 'object');
      assert(typeof cache['test/fixtures/a.md'].path === 'string');
      assert(typeof cache['test/fixtures/a.md'].stat === 'object');
    });

    it('should pass nonull option to matched:', function () {
      var cache = {};
      var views = loader(cache);
      views('*.foo', {
        nonull: true,
        cwd: 'test/fixtures',
      });
      assert.deepEqual(cache, {});
    });
  });
});
