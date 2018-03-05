/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const path = require('path');
const contents = require('file-contents');
const globParent = require('glob-parent');
const isGlob = require('is-glob');
const typeOf = require('kind-of');
const glob = require('matched');
const File = require('vinyl');
const utils = require('./utils');

/**
 * Create an instance of `Loader` with the given `options`.
 *
 * ```js
 * const Loader = require('load-templates');
 * const loader = new Loader();
 * ```
 * @name Loader
 * @param {Object} `options`
 * @api public
 */

class Loader {
  constructor(options) {
    this.options = Object.assign({}, options);
    this.cache = this.options.cache || {};
  }

  /**
   * Load one or more templates from a filepath, glob pattern, object, or
   * array of filepaths, glob patterns or objects. This method detects
   * the type of value to be handled then calls one of the other methods
   * to do the actual loading.
   *
   * ```js
   * const loader = new Loader();
   * console.log(loader.load(['foo/*.hbs', 'bar/*.hbs']));
   * console.log(loader.load({path: 'a/b/c.md'}));
   * console.log(loader.load('index', {path: 'a/b/c.md'}));
   * ```
   * @name .load
   * @param {Object} `value`
   * @param {Object} `options`
   * @return {Object} Returns the views from `loader.cache`
   * @api public
   */

  load(value, options) {
    switch (typeOf(value)) {
      case 'object':
        if (utils.isView(value)) {
          this.addView(value, options);
          break;
        }
        this.addViews(value, options);
        break;
      case 'array':
        value.forEach(val => this.load(val, options));
        break;
      case 'string':
        if (utils.isView(options)) {
          this.addView(value, options);
          break;
        }
        this.globViews(value, options);
        break;
      default: {
        throw new TypeError('invalid arguments');
      }
    }
    return this.cache;
  }

  /**
   * Create a view from the given `template` and cache it on `loader.cache`.
   *
   * ```js
   * const loader = new Loader();
   * loader.addView('foo.hbs');
   * console.log(loader.cache);
   * ```
   * @name .addView
   * @param {String|Object} `template`
   * @param {Object} `options`
   * @return {Object} Returns the `Loader` instance for chaining
   * @api public
   */

  addView(name, options) {
    const view = this.createView(name, options);
    this.cache[view.key] = view;
    return this;
  }

  /**
   * Create from an array or object of `templates` and cache them on
   * `loader.cache`.
   *
   * ```js
   * const loader = new Loader();
   * loader.addViews([
   *   {path: 'test/fixtures/a.md'},
   *   {path: 'test/fixtures/b.md'},
   *   {path: 'test/fixtures/c.md'},
   * ]);
   * loader.addViews({
   *   d: {path: 'test/fixtures/d.md'},
   *   e: {path: 'test/fixtures/e.md'},
   *   f: {path: 'test/fixtures/f.md'},
   * });
   * loader.addViews([{
   *   g: {path: 'test/fixtures/g.md'},
   *   h: {path: 'test/fixtures/h.md'},
   *   i: {path: 'test/fixtures/i.md'},
   * }]);
   * console.log(loader.cache);
   * ```
   * @name .addViews
   * @param {Object} `templates`
   * @param {Object} `options`
   * @api public
   */

  addViews(views, options) {
    if (typeof views === 'string') {
      return this.addView(views, options);
    }

    if (Array.isArray(views)) {
      for (let i = 0; i < views.length; i++) {
        this.addViews(views[i], options);
      }
      return this;
    }

    if (typeOf(views) !== 'object') {
      throw new TypeError('expected a string, object or array');
    }

    if (utils.isView(views)) {
      this.addView(views, options);
      return this;
    }

    for (const key of Object.keys(views)) {
      let view = views[key];

      if (utils.isView(view)) {
        view.key = key;
      } else if (typeof view === 'string') {
        view = { key, path: key, content: view };
      } else {
        throw new TypeError('expected view to be an object or string');
      }

      this.addView(view, options);
    }
    return this;
  }

  /**
   * Create a `view` object from the given `template`. View objects are
   * instances of [vinyl][].
   *
   * ```js
   * console.log(loader.createView('test/fixtures/foo/bar.hbs'));
   * console.log(loader.createView('foo/bar.hbs', {cwd: 'test/fixtures'}));
   * ```
   * @name .createView
   * @param {Object|String} `template` Filepath or object with `path` or `contents` properties.
   * @param {Object} `options`
   * @return {Object} Returns the view.
   * @api public
   */

  createView(view, options) {
    options = options || {};
    let opts = Object.assign({ cwd: process.cwd() }, this.options);
    let key;

    if (typeOf(view) === 'object') {
      view = File.isVinyl(view) ? view : new File(view);
      opts = Object.assign({}, opts, options);

    } else if (typeof view === 'string') {
      key = view;
      if (File.isVinyl(options)) {
        view = options;
      } else {
        view = new File(Object.assign({ path: key }, options));
        opts = Object.assign({}, opts, options);
      }
      view.cwd = opts.cwd;
    } else {
      throw new TypeError('expected view to be a string or object');
    }

    view.cwd = path.resolve(view.cwd);
    view.base = path.resolve(options.base || view.cwd);

    // prime the view's metadata objects
    view.options = view.options || {};
    view.locals = view.locals || {};
    view.data = view.data || {};

    // ensure view.key and view.path exist before calling "renameKey"
    view.key = view.key || view.path;
    view.path = view.path || path.resolve(opts.cwd, view.key);
    view.key = utils.renameKey(view, opts);

    // "options.loaderFn" is deprecated and will be removed in the next major release
    const onLoad = opts.onLoad || opts.loaderFn;
    if (typeof onLoad === 'function') {
      view = onLoad(view) || view;
    }

    utils.normalizeContent(view);
    contents.sync(view, opts);
    view.isView = true;
    return view;
  }

  /**
   * Load templates from one or more glob `patterns` with the given `options`,
   * then cache them on `loader.cache`.
   *
   * ```js
   * const loader = new Loader();
   * const views = loader.globViews('*.hbs', {cwd: 'templates'});
   * ```
   * @name .globViews
   * @param {String|Array} `patterns`
   * @param {Object} `options`
   * @return {Object} Returns `loader.cache`
   * @api public
   */

  globViews(patterns, options) {
    patterns = utils.arrayify(patterns);
    const opts = Object.assign({ cwd: process.cwd() }, this.options, options);
    delete opts.nonull;

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const is = isGlob(pattern);

      let files = is ? glob.sync(pattern, opts) : [];
      if (files.length === 0) {
        files = !is ? [pattern] : [];
      } else {
        files = files.map(f => path.resolve(opts.cwd, f));
      }

      if (files.length) {
        const parent = path.resolve(is ? globParent(pattern) : '.');
        const base = path.resolve(opts.cwd, parent);
        this.addViews(files, Object.assign({}, options, { base: base }));
      }
    }
    return this.cache;
  }

  static load(...args) {
    const loader = new Loader();
    return loader.load(...args);
  }
}

/**
 * Expose `Loader`
 */

module.exports = Loader;
