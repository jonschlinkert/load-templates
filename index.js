'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var glob = require('globby');
var arrayify = require('arrayify-compact');
var extend = _.extend;


/**
 * ```js
 * var loader = require('load-templates');
 * ```
 * @param {Object} `options` Options to initialize `loader` with
 *     @option {String} [option] `cwd` Current working directory to use for file paths.
 *     @option {Function} [option] `parse` Function to use for parsing templates.
 *     @option {Function} [option] `rename` Renaming function to use on the `key` of each template loaded, `path.basename` is the default.
 *     @option {Function} [option] `normalize` Function to use for normalizing `file` objects before they are returned.
 *     @option {Boolean} [option] `norename` Set to `true` to disable the default `rename` function.
 *     @option {Boolean} [option] `noparse` Set to `true` to disable the default `parse` function.
 *     @option {Boolean} [option] `nonormalize` Set to `true` to disable the default `normalize` function.
 * @api public
 */

function loader(options) {
  loader.options = extend({
    cwd: process.cwd()
  }, options);
  return loader;
}


/**
 * Options cache.
 *
 * @type {Object}
 */

loader.options = {};


/**
 * Properties expected on the root of a normalized `file` object.
 *
 * @type {Array}
 */

loader.rootProps = ['data', 'locals', 'content', 'path', 'orig'];


/**
 * Expand glob patterns, load, read, parse and normalize files from
 * file paths, strings, objects, or arrays of these types.
 *
 * **Examples:**
 *
 * Filepaths or arrays of glob patterns.
 *
 * ```js
 * var temlates = loader.load(['pages/*.hbs']);
 * var posts = loader.load('posts/*.md');
 * ```
 *
 * As strings or objects:
 *
 * ```js
 * // loader.load(key, value, locals);
 * var docs = loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});
 *
 * // loader.load(key, value, locals);
 * var post = loader.load('abc.md', 'My name is <%= name %>.', {name: 'Jon Schlinkert'});
 * ```
 *
 * @param {String|Object|Array} `key` Array, object, string or file paths.
 * @param {String|Object} `value` String of content, `file` object with `content` property, or `locals` if the first arg is a file path.
 * @param {Object} `options` Options or `locals`.
 * @return {Object} Normalized file object.
 * @api public
 */

loader.load = function (key, value, options) {
  var method = loader[typeOf(key)];
  if (method) {
    return method.call(this, key, value, options);
  }
};


/**
 * Expand glob patterns, load, read, parse and normalize files
 * from file paths or strings.
 *
 * @param  {String} `key` Glob patterns or file paths.
 * @param  {String|Object} `value` String of content, `file` object with `content` property, or `locals` if the first arg is a file path.
 * @param {Object} `options` Options or `locals`.
 * @return {Object} Normalized file object.
 * @api public
 */

loader.string = function (key, value, options) {
  var args = [].slice.call(arguments).filter(Boolean);
  var file = {}, files = [];

  if (typeof args[1] === 'string') {
    file[key] = {};
    file[key].content = value;
  } else {
    var patterns = arrayify(key).map(function(pattern) {
      return loader._cwd(pattern);
    });

    files = glob.sync(patterns, {nonull: false});
    if (files.length > 0) {
      files.forEach(function (filepath) {
        var key = loader.rename(filepath);
        file[key] = loader.parse(filepath);
        file[key].path = filepath;
        file[key].data = extend({}, file[key].data, value);
      });
    } else {
      file[key] = value || {};
    }
  }

  // The object should be parsed and key renamed.
  return loader.object(file, options);
};


/**
 * Normalize an array of patterns.
 *
 * @param  {Object} `patterns` Glob patterns or array of filepaths.
 * @param  {Object} `options` Options or `locals`
 * @return {Array}  Array of normalized file objects.
 * @api public
 */

loader.array = function (patterns, options) {
  var o = {};
  arrayify(patterns).forEach(function (pattern) {
    extend(o, loader.load(pattern, options));
  });
  return o;
};


/**
 * Normalize a template object.
 *
 * @param  {Object} `file` The object to normalize.
 * @param  {Object} `options` Options or `locals`
 * @api public
 */

loader.object = function (file, options) {
  return this.normalize(file, options);
};


/**
 * The current working directory to use. Default is `process.cwd()`.
 *
 * @param  {String} `filepath`
 * @api public
 */

loader._cwd = function (filepath) {
  var cwd = path.resolve(this.options.cwd);
  return path.join(cwd, filepath);
};


/**
 * Rename the `key` of each template loaded using whatever rename function
 * is defined on the options. `path.basename` is the default.
 *
 * @param  {String} `filepath`
 * @api public
 */

loader.rename = function (filepath) {
  if (this.options.rename) {
    return this.options.rename(filepath);
  }
  return filepath;
};


/**
 * Parse the content of each template loaded using whatever parsing function
 * is defined on the options. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read/parse.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

loader.parse = function (filepath, options) {
  var remove = _.keys(this.options).concat('normalized');
  var opts = extend({}, this.options, options);
  var o = {};

  if (opts.noparse) {
    return filepath;
  }

  if (opts.parse) {
    return opts.parse(filepath, _.omit(opts, remove));
  }

  o.path = filepath;
  o.content = fs.readFileSync(filepath, 'utf8');
  o.data = _.omit(opts, remove);
  return o;
};


/**
 * Normalize a template using whatever normalize function is
 * defined on the options.
 *
 * @param  {Object} `file` The template object to normalize.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

loader.normalize = function (file, options) {
  var remove = _.keys(this.options).concat('normalized');
  var opts = _.extend({}, this.options, options);

  if (opts.nonormalize) {
    return file;
  }

  if (opts.normalize) {
    return opts.normalize(file);
  }
  var o = {}, data = _.omit(opts, remove);

  _.forIn(file, function (value, key) {
    value.path = value.path || key;

    if (!value.hasOwnProperty('normalized')) {
      key = loader.rename(key);
      delete value.normalized;
    }

    var root = _.pick(value, loader.rootProps);
    root.data = extend({}, data, value.data, _.omit(value, loader.rootProps));
    o[key] = root;
  });

  return o;
};


/**
 * Get the type of an object.
 *
 * @param  {*} value
 * @return {*}
 * @api private
 */

function typeOf(value) {
  return Object.prototype.toString.call(value).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
}

module.exports = loader;