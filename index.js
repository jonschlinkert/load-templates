/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';


var fs = require('fs');
var glob = require('globby');
var isAbsolute = require('is-absolute');
var arrayify = require('arrayify-compact');
var matter = require('gray-matter');
var debug = require('debug')('template-loader');
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

function loader(options) {
  loader.init(options);
  return loader;
}


/**
 * Options cache
 *
 * @type {Object}
 */

loader.options = {};


/**
 * Template cache
 *
 * @type {Object}
 */

loader.cache = {};


/**
 * Initialize default configuration.
 *
 * @api private
 */

loader.init = function(opts) {
  debug('init', arguments);
  loader.options = {};
  loader.cache = {};

  loader.extend(opts);
  loader.fallback('rename', utils.rename);
  loader.fallback('cwd', process.cwd());
  loader.fallback('locals', {});
};


/**
 * Extend the options.
 *
 * @api private
 */

loader.extend = function(obj) {
  return _.extend(loader.options, obj);
};


/**
 * Extend the options.
 *
 * @api private
 */

loader.fallback = function(key, value) {
  return loader.option(key) ?
    loader.option(key) :
    loader.option(key, value);
};


/**
 * ## .option
 *
 * Set or get an option.
 *
 * ```js
 * loader.option('a', true)
 * loader.option('a')
 * // => true
 * ```
 *
 * @method option
 * @param {String} `key`
 * @param {*} `value`
 * @return {*}
 * @api public
 */

loader.option = function(key, value) {
  var args = [].slice.call(arguments);

  if (args.length === 1 && typeof key === 'string') {
    return loader.options[key];
  }

  if (typeof key === 'object') {
    _.extend.apply(_, [loader.options].concat(args));
    return loader;
  }

  loader.options[key] = value;
  return loader;
};


/**
 * Parse files and extract front matter.
 *
 * @param  {String} `str` String to parse.
 * @param  {Object} `options` Options to pass to [gray-matter].
 * @api public
 */

loader.parse = function (str, options) {
  if (str) {
    var file = matter(str, _.extend({autodetect: true}, options));
    file.content = file.content.replace(/^\s*/, '');
    return file;
  }
  return str;
};


/**
 * Set templates on the cache.
 *
 * @param  {String} `name` Template name
 * @param  {String} `str` String to parse.
 * @param  {Object} `options` loader options
 * @api public
 */

loader.set = function (name, str, options) {
  var o = {};
  if (utils.typeOf(str) === 'string') {
    o[name] = {
      content: str
    };
  } else {
    o[name] = str;
  }
  loader.object(o, options);
  return loader;
};


/**
 * Get a template from the cache.
 *
 * @param  {String} `key` The name of the template to get.
 * @api public
 */

loader.get = function (key) {
  if (!key) {
    return loader.cache;
  }
  return loader.cache[key];
};


/**
 * Normalize and flatten `locals` and `data` objects.
 *
 * @param  {Object} `obj` The object to normalize.
 * @return {Object}
 * @api public
 */

loader.flatten = function (o, name) {
  debug('flatten', arguments);

  utils.flattenData(o.data, ['locals', 'content', 'original']);
  utils.flattenData(o.data);
  delete o.locals;
  return o;
};


/**
 * Resolve, load, and parse all files based on type.
 *
 * @param  {*}  `pattern` Array, object, function or string.
 * @param  {Object} `options` loader options.
 * @return {Array}  Array of file objects.
 * @api public
 */

loader.load = function (pattern, locals) {
  var args = [].slice.call(arguments);
  var opts = _.extend({}, locals);
  debug('load', arguments);

  var method = loader[utils.typeOf(pattern)];
  if (method) {
    return method.apply(loader, args);
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

loader.string = function (name, content, locals) {
  var opts = _.extend({}, loader.options, locals);
  var fn = loader.option('rename');
  var o = {};

  if (utils.typeOf(content) === 'object') {
    locals = content;
    content = null;
  }

  if (isAbsolute(name)) {
    var file = fs.readFileSync(name, 'utf8');
    var name = fn(name, opts);
    o[name] = loader.parse(file, opts);
    loader.object(o, locals);
  } else {
    var arr = glob.sync(name, opts);
    if (arr.length > 0) {
      loader.load(arr.map(utils.absolute), locals);
    } else {
      o[name] = {
        content: content,
        data: locals
      };
      loader.object(o);
    }
  }

  return loader;
};


/**
 * Normalize a template object.
 *
 * @param  {Object} `obj` The object to normalize.
 * @param  {Object} `options` Locals or loader options.
 * @api public
 */

loader.object = function (obj, locals) {
  debug('object', arguments);

  var globals = loader.option('locals');
  var opts = _.defaults({}, locals, globals);
  var data = _.defaults({}, opts.locals, opts.data, opts);
  var file = _.cloneDeep(obj);

  opts = _.extend({}, loader.options, opts);
  var o = {};

  _.forIn(file, function(value, key) {
    if (utils.typeOf(value) === 'object' &&
        value.hasOwnProperty('content')) {
      o[key] = loader.parse(value.content, opts);
      o[key].data = _.extend({}, value, o[key].data, data);
      _.extend(o[key].data, o[key].data.data);
      _.extend(o[key].data, o[key].data.locals);
      o[key].data = _.omit(o[key].data, ['original', 'locals', 'data', 'content']);
    } else if (utils.typeOf(value) === 'string') {
      o[key] = loader.parse(value, opts);
      o[key].data = _.extend({}, o[key].data, data);
    } else {
      throw new Error('Loader#object cannot normalize:', obj);
    }
    loader.flatten(o[key]);
  }.bind(loader));

  _.extend.apply(_, [loader.cache].concat(o));
  return o;
};


/**
 * Load multiple template objects.
 *
 * @param  {Object} `objects` Template objects.
 * @param  {Object} `options` loader options.
 * @api public
 */

loader.objects = function (objects, locals) {
  _.forIn(objects, function (value, key) {
    var o = {};

    if (utils.typeOf(value) === 'string') {
      value = {content: value};
    }

    o[key] = value;
    loader.object(o, locals);
  }.bind(loader));
};


/**
 * Call `load` for each item in the array.
 *
 * @param  {Object} `patterns` Glob patterns or array of filepaths.
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of files as Vinyl objects
 * @api public
 */

loader.array = function (patterns, locals) {
  debug('array', arguments);

  arrayify(patterns).forEach(function (pattern) {
    loader.load(pattern, locals);
  }.bind(loader));

  return loader;
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

loader.function = function (fn, locals) {
  debug('function', arguments);
  return loader.load(fn(), locals);
};


/**
 * Export `Loader`
 */

module.exports = loader;
