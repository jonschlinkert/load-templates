/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var arrayify = require('arrayify-compact');
var isAbsolute = require('is-absolute');
var resolve = require('resolve-dep');
var async = require('async');
var glob = require('globby');
var utils = require('parser-utils');
// var utils = require('./utils');
var _ = require('lodash');
var extend = _.extend;


/**
 * Create a new instance of `Loader`, optionally
 * passing default `options`.
 *
 * **Example:**
 *
 * ```js
 * var templates = require('load-templates');
 * ```
 *
 * @param {Object} `options` Default options for front-matter and template naming.
 * @api public
 */

function templates(patterns, options) {
  var args = [].slice.call(arguments);

  var method = this[typeOf(patterns)];
  if (method) {
    return method.apply(this, args);
  }
}


templates.cache = {};


templates.set = function(key, value, locals) {
  var args = [].slice.call(arguments);
  var arity = args.length;
  var file = {};

  if (isAbsolute(key) && typeOf(value) !== 'string') {
    locals = value;
    file = this.fileSync(key, locals);
  } else {
    file = this.normalize(value, locals);
  }

  if (!file.path) {
    file.path = key;
  }

  this.cache[key] = file;
  return this;
};

templates.get = function(key) {
  if (!key) {
    return this.cache;
  }
  return this.cache[key];
};


templates.fileSync = function(filepath, options) {
  var opts = _.extend({}, options);

  try {
    var str = fs.readFileSync(filepath, 'utf8');
    var file = this.normalize(str, options);
    file.path = path.resolve(filepath);
    return file;
  } catch (err) {
    return err;
  }
};


templates.globSync = function(patterns, options) {
  patterns = patterns.length ? arrayify(patterns) : [];
  var opts = _.extend({}, options);

  return glob.sync(patterns, options).map(function(fp) {
    return this.fileSync(fp, opts);
  }.bind(this));
};


/**
 * Load a template from a string.
 *
 * ```js
 * template.string('author', 'Jon <%= name %>', {name: 'Schlinkert'});
 * ```
 *
 * @param  {String} `pattern` String, glob pattern or file paths.
 * @param  {Object} `options` templates options.
 * @return {Object}
 * @api private
 */

templates.string = function (name, str, locals) {
  var args = [].slice.call(arguments);
  var arity = args.length;
  var file = {};

  if (isAbsolute(name) && typeOf(str) !== 'string') {
    locals = str;
    file = this.fileSync(name, locals);
  } else {
    file = this.normalize(str, locals);
  }

  this.set(name, file);
  return file;
};


/**
 * Normalize a template object.
 *
 * @param  {Object} `obj` The object to normalize.
 * @param  {Object} `options` Locals or templates options.
 * @api private
 */

templates.object = function (obj, locals) {
  var opts = _.extend({}, obj, locals);
  var data = _.defaults({}, opts.locals, opts.data);
  var o = {};

  var name = obj.name || obj.path;
  o = this.normalize(name, obj, data, opts);
  return this;
};


/**
 * Call `load` for each item in the array.
 *
 * @param  {Object} `patterns` Glob patterns or array of filepaths.
 * @param  {Object} `options` Additional options to pass
 * @return {Array} Returns an array of normalized `file` object.
 * @api private
 */

templates.array = function (patterns, locals) {
  arrayify(patterns).forEach(function (pattern) {
    this.load(pattern, locals);
  }.bind(this));
  return this;
};


/**
 * Call the function and pass the results to
 * `load` for futher processing.
 *
 * @param  {Function} `fn` Function to call.
 * @param  {Object} `locals` Locals or templates options.
 * @return {*}
 * @api private
 */

templates.function = function (fn, locals) {
  var helper = fn();

  if (utils.typeOf(helper) === 'object') {
    return helper;
  }
  return this.load(helper, locals);
};



/**
 * Normalize `file` to have expected properties:
 *
 *   - `data`: Usually locals
 *   - `path`: the filepath of the file
 *   - `content`: The content of the file, as a `utf8` string.
 *
 * This method is a proxy to `.extendFile()` from [parser-utils].
 *
 * @param  {String|Object} `file` File object or string to normalize.
 * @param  {String} `options` Options or locals.
 * @return {Object} Normalized file object.
 * @api private
 */

templates.normalize = function(file, options) {
  return utils.extendFile(file, options);
};



function typeOf(value) {
  return Object.prototype.toString.call(value)
    .toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
}

/**
 * Expose `templates`
 */

module.exports = templates;
