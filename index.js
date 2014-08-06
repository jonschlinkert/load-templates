/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';


var fs = require('fs');
var util = require('util');
var glob = require('globby');
var isAbsolute = require('is-absolute');
var arrayify = require('arrayify-compact');
var Cache = require('config-cache');
var matter = require('gray-matter');
var debug = require('debug')('loader');
var utils = require('./utils');
var _ = require('lodash');


/**
 * ## Loader
 *
 * Create a new instance of `Loader`, optionally
 * passing default `options`.
 *
 * **Example:**
 *
 * ```js
 * var Loader = require('template-loader');
 * var templates = new Loader();
 * ```
 *
 * @class `Loader`
 * @param {Object} `options` Default options for front-matter and template naming.
 * @api public
 */

function Loader(config) {
  Cache.call(this, config);
  this.defaultConfig(config);
}
util.inherits(Loader, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Loader.prototype.defaultConfig = function(config) {
  debug('defaultConfig', arguments);

  var opts = _.extend({}, config && config.options);
  this.option('locals', opts.locals);
  this.option('withExt', opts.withExt || false);
  this.option('rename', opts.rename || utils.name);
  this.option('cwd', opts.cwd || process.cwd());
  this.option(opts);

  // Keep the cache clean for storing templates.
  this.omit(['locals', 'data', 'options']);
};


/**
 * Parse files and extract front matter.
 *
 * @param  {String} `str` String to parse.
 * @param  {Object} `options` Options to pass to [gray-matter].
 * @api public
 */

Loader.prototype.parse = function (str, options) {
  return matter(str, _.extend({autodetect: true}, options));
};


/**
 * Set templates on the cache.
 *
 * @param  {String} `name` Template name
 * @param  {String} `str` String to parse.
 * @param  {Object} `options` loader options
 * @api public
 */

Loader.prototype.set = function (name, str, options) {
  var obj = {};
  if (utils.typeOf(str) === 'string') {
    obj[name] = {content: str};
  } else {
    obj[name] = str;
  }
  this.object(obj, options);
  return this;
};


/**
 * Normalize and flatten `locals` and `data` objects.
 *
 * @param  {Object} `obj` The object to normalize.
 * @return {Object}
 * @api public
 */

Loader.prototype.flatten = function (obj) {
  debug('flatten', arguments);

  this.flattenData(obj.data, ['locals', 'content', 'original']);
  this.flattenData(obj.data);
  delete obj.locals;
  return obj;
};


/**
 * Resolve, load, and parse all files based on type.
 *
 * @param  {*}  `pattern` Array, object, function or string.
 * @param  {Object} `options` loader options.
 * @return {Array}  Array of file objects.
 * @api public
 */

Loader.prototype.load = function (pattern, options) {
  options = _.extend({}, options);
  debug('load', arguments);

  var loader = this[utils.typeOf(pattern)];
  if (loader) {
    return loader.call(this, pattern, options);
  }
  return;
};


/**
 * Resolve files paths and require them in, calling `.load()`
 * for futher processing.
 *
 * @param  {String} `pattern` Glob patterns or file paths.
 * @param  {Object} `options` loader options.
 * @return {Object}
 * @api public
 */

Loader.prototype.string = function (pattern, locals) {
  var opts = _.extend({}, this.options, locals);
  var fn = this.option('rename');
  var obj = {};

  if (isAbsolute(pattern)) {
    var file = fs.readFileSync(pattern, 'utf8');
    var name = fn(pattern, opts);

    obj[name] = this.parse(file, opts);
    this.object(obj, locals);
  } else {
    var arr = glob.sync(pattern, opts);
    this.load(arr.map(utils.absolute), locals);
  }
  return this;
};


/**
 * Call the function and pass the results to
 * `load` for futher processing.
 *
 * @param  {Function} `fn` Function to call.
 * @param  {Object} `locals` Locals or loader options.
 * @return {*}
 * @api public
 */

Loader.prototype.function = function (fn, locals) {
  debug('function', arguments);
  return this.load(fn(), locals);
};


/**
 * Normalize a template object.
 *
 * @param  {Object} `obj` The object to normalize.
 * @param  {Object} `options` Locals or loader options.
 * @api public
 */

Loader.prototype.object = function (obj, options) {
  var data = this.option('locals');
  var opts = _.extend({}, options);
  var data = _.extend({}, opts, opts.data, opts.locals);
  var file = _.cloneDeep(obj);
  debug('object', arguments);

  opts = _.extend({}, this.options, opts);
  var o = {};

  _.forIn(file, function(value, key) {
    if (value.hasOwnProperty('content')) {
      o[key] = this.parse(value.content, opts);
      o[key].data = _.extend({}, value, o[key].data, data);
      this.flatten(o[key]);
    } else {
      throw new Error('Loader#object expects a `content` property.');
    }
  }.bind(this));
  this.extend(o);
  return o;
};


/**
 * Load multiple template objects.
 *
 * @param  {Object} `objects` Template objects.
 * @param  {Object} `options` loader options.
 * @api public
 */

Loader.prototype.objects = function (objects, options) {
  _.forIn(objects, function (value, key) {
    var o = {};

    if (utils.typeOf(value) === 'string') {
      value = {content: value};
    }

    o[key] = value;
    this.object(o, options);
  }.bind(this));
};


/**
 * Call `load` for each item in the array.
 *
 * @param  {Object} `patterns` Glob patterns or array of filepaths.
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of files as Vinyl objects
 * @api public
 */

Loader.prototype.array = function (patterns, options) {
  debug('array', arguments);

  arrayify(patterns).forEach(function (pattern) {
    this.load(pattern, options);
  }.bind(this));

  return this;
};


/**
 * Export `Loader`
 */

module.exports = Loader;
