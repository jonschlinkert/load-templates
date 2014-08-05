/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var util = require('util');
var glob = require('globby');
var arrayify = require('arrayify-compact');
var debug = require('debug')('template-loader');
var resolve = require('resolve-dep');
var matter = require('gray-matter');
var Cache = require('config-cache');



function parseFile (filepath, obj, options) {
  debug('parseFile', arguments);
  var file = _parseFile(filepath, options);
  file.data = _.extend({}, file.data, obj.data);
  return file;
}

function parseString (obj, options) {
  debug('parseString', arguments);
  var file =_parseString(obj.content, options);
  file.data = _.extend({}, file.data, obj.data);
  return file;
}



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
 * @param {Object} `config` Default config settings.
 * @api public
 */

function Loader(config) {
  Cache.call(this, config);
  debug('Loader', arguments);

  this.extend(config);
  this.defaultConfig();
}

util.inherits(Loader, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Loader.prototype.defaultConfig = function() {
  this.set('cwd', this.cache.cwd || process.cwd());
  this.set('templates', this.cache.templates || {});
  this.set('locals', this.cache.locals || {});
};


/**
 * Resolve, load, and parse all pages based on type.
 *
 * @param  {mixed}  `pages`   Array, object, function, or string to load pages from.
 * @param  {Object} `options` additional options to pass to loading/parsing methods
 * @return {Array}  a list of pages as Vinyl objects
 */

Loader.prototype.normalize = function(pages, options) {
  debug('normalize', arguments);
  options = _.extend({}, this.options, options);
  var files = [];

  var process = this[utils.typeOf(pages)];
  if (process) {
    files = process.call(this, pages, options);
  }
  return _.flatten(files);
};


/**
 * Resolve pages paths and require them in, calling `.normalize()`
 * for futher processing.
 *
 * @param  {String} `str`     Glob pattern used for resolving file paths
 * @param  {Object} `options` Additional options to pass to resolve-dep
 * @return {Array}  a list of pages as Vinyl objects
 */

Loader.prototype.string = function (str, options) {
  debug('string', arguments);
  var resolved = resolve(str, options);
  debug('resolved', resolved);

  return _.flatten(resolved.map(function (filepath) {
    var ext = path.extname(filepath);
    var pages = {};
    if (ext === '.js') {
      pages = require(filepath);
    } else {
      pages = {
        filepath: filepath
      };
    }

    return this.normalize(pages, options);
  }.bind(this)));
};


/**
 * Call the function and pass the results to
 * `normalize` for futher processing.
 *
 * @param  {Function} `fn`    Function to call.
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of pages as Vinyl objects
 */

Loader.prototype.function = function (fn, options) {
  debug('function', arguments);
  return this.normalize(fn(), options);
};


/**
 * Map an object to Vinyl files
 *
 * @param  {Object} `obj`     object to map
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of pages as Vinyl objects
 * @api private
 */

Loader.prototype.object = function (obj, options) {
  debug('object', arguments);
  // if `obj` has a `filepath` property map it directly
  if ('filepath' in obj) {
    options.filepath = obj.filepath;
    var file = null;
    if ('content' in obj) {
      file = parseString(obj, options);
    } else {
      file = parseFile(obj.filepath, obj, options);
    }
    return [file];
  }

  // When the object is a list of filepath/page properties
  // map each one, calling normalize if needed.
  return _.flatten(_.keys(obj).map(function (filepath) {
    var page = obj[filepath];
    var type = utils.typeOf(page);
    if (type === 'object') {
      page.filepath = page.filepath || filepath;
      return this.object(page, options);
    }
    return this.normalize(page, options);
  }.bind(this)));
};


/**
 * Call `normalize` for each item in the array.
 *
 * @param  {Object} `arr`     array to normalize
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of pages as Vinyl objects
 */

Loader.prototype.array = function (arr, options) {
  debug('array', arguments);
  return _.flatten(arr.map(function (page) {
    return this.normalize(page, options);
  }.bind(this)));
};


module.exports = Loader;
