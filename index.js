/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';


var fs = require('fs');
var path = require('path');
var util = require('util');
var isAbsolute = require('is-absolute');
var arrayify = require('arrayify-compact');
var segments = require('path-segments');
var Cache = require('config-cache');
var debug = require('debug')('loader');
var glob = require('globby');
var matter = require('gray-matter');
var utils = require('./utils');
var _ = require('lodash');


var name = function(filepath, options) {
  var opts = _.extend({last: 1, withExt: false}, options);
  var res = segments(filepath, opts);
  if (opts.withExt) {
    return res.replace(/(\.)/g, '\\$1');
  }
  return res.replace(/\.[\S]+$/, '');
};

var absolute = function(filepath) {
  return path.resolve(filepath);
};


/**
 * ## Loader
 *
 * Create a new instance of `Loader`, optionally
 * passing default `config`.
 *
 * **Example:**
 *
 * ```js
 * var Loader = require('template-loader');
 * var templates = new Loader();
 * ```
 *
 * @class `Loader`
 * @param {Object} `config` Default config settings, includes options
 *                          for front matter parsers an renaming.
 * @api public
 */

function Loader(config) {
  Cache.call(this, config);
  this.option(config);
  this.defaultConfig();
}

util.inherits(Loader, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Loader.prototype.defaultConfig = function() {
  debug('defaultConfig', arguments);
  this.option('cwd', this.options.cwd || process.cwd());
  this.fn = this.option('rename') || name;
  this.clear('data');
};


/**
 * Parse files and extract front matter.
 *
 * @param  {String} `str` String to parse.
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of files as Vinyl objects
 * @api public
 */

Loader.prototype.parse = function (str, options) {
  return matter(str, _.extend({autodetect: true}, options));
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

  this.flattenData(obj.data, 'locals');
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

Loader.prototype.string = function (pattern, options) {
  var opts = _.extend({}, this.options, options);
  var obj = {};

  if (isAbsolute(pattern)) {
    var file = fs.readFileSync(pattern, 'utf8');
    var name = this.fn(pattern, opts);
    obj[name] = this.parse(file, opts);
    this.object(obj, options);
  } else {
    this.load(glob.sync(pattern, opts).map(absolute));
  }
  return this;
};


/**
 * Call the function and pass the results to
 * `load` for futher processing.
 *
 * @param  {Function} `fn` Function to call.
 * @param  {Object} `options` loader options.
 * @return {*}
 * @api public
 */

Loader.prototype.function = function (fn, options) {
  debug('function', arguments);
  return this.load(fn(), options);
};


/**
 * Normalize a template object.
 *
 * @param  {Object} `obj` The object to normalize.
 * @param  {Object} `options` loader options.
 * @return {Array} Array of template objects.
 * @api public
 */

Loader.prototype.object = function (obj, options) {
  var opts = _.extend({}, options);
  var data = _.extend({}, opts, opts.data, opts.locals);
  var file = _.cloneDeep(obj);

  debug('object', arguments);

  opts = _.extend({}, this.options, opts);
  var o = {};

  _.forIn(file, function(value, key) {
    if (value.hasOwnProperty('content')) {
      o[key] = this.parse(value.content, opts);
      o[key].data = _.extend({}, o[key].data, data);
      this.flatten(o[key]);
    } else {
      throw new Error('Loader#object expects a `content` property.');
    }
  }.bind(this));

  this.extend(o);
  return o;
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


module.exports = Loader;
