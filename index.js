/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';


var arrayify = require('arrayify-compact');
var debug = require('debug')('template-loader');
var fs = require('fs');
var glob = require('globby');
var isAbsolute = require('is-absolute');
var matter = require('gray-matter');
var resolve = require('resolve-dep');
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
  opts = _.cloneDeep(opts);

  this.options = {};
  this.cache = {};

  this.extend(opts);
  this.option('rename', utils.rename);
  this.option('cwd', process.cwd());
  this.option('locals', {});
  this.overrides(opts);
};


/**
 * Override default options with user-defined `opts`
 * during initialization.
 *
 * @api private
 */

loader.overrides = function(opts) {
  if (opts && Object.keys(opts).length) {
    _.forIn(opts, function (value, key) {
      this.option(key, value);
    }.bind(this));
  }
};


/**
 * Extend the options.
 *
 * @api private
 */

loader.extend = function(obj) {
  return _.extend(this.options, obj);
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
    return this.options[key];
  }

  if (typeof key === 'object') {
    _.extend.apply(_, [this.options].concat(args));
    return this;
  }

  this.options[key] = value;
  return this;
};


/**
 * Parse files and extract front matter.
 *
 * @param  {String} `str` String to parse.
 * @param  {Object} `options` Options to pass to [gray-matter].
 * @api public
 */

loader.parse = function (str, options) {
  var file = matter(str, _.extend({autodetect: true}, options));
  file.content = file.content.replace(/^\s*/, '');
  return file;
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

  this.object(o, options);
  return this;
};


/**
 * Get a template from the cache.
 *
 * @param  {String} `key` The name of the template to get.
 * @api public
 */

loader.get = function (key) {
  if (!key) {
    return this.cache;
  }
  return this.cache[key];
};


/**
 * Normalize and flatten `locals` and `data` objects.
 *
 * @param  {Object} `obj` The object to normalize.
 * @return {Object}
 * @api public
 */

loader.flatten = function (o) {
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

loader.load = function (pattern) {
  var args = [].slice.call(arguments);
  debug('load', arguments);

  var method = loader[utils.typeOf(pattern)];
  if (method) {
    return method.apply(loader, args);
  }
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
  var opts = _.extend({}, this.options, locals);
  var fn = this.option('rename');
  var o = {};

  if (utils.typeOf(content) === 'object') {
    locals = content;
    content = null;
  }

  if (isAbsolute(name)) {
    var filepath = name;
    var file = fs.readFileSync(filepath, 'utf8');
    name = fn(name, opts);

    o[name] = this.parse(file, opts);
    o[name].path = filepath;

    this.object(o, locals);
  } else {
    var arr = glob.sync(name, opts);
    if (arr.length > 0) {
      this.load(arr.map(utils.absolute), locals);
    } else {
      o[name] = {
        path: name,
        content: content,
        data: locals
      };
      this.object(o);
    }
  }

  return this;
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

  var globals = this.option('locals');
  var opts = _.defaults({}, locals, globals);
  var data = _.defaults({}, opts.locals, opts.data, globals);

  opts = _.extend({}, this.options, opts);
  var o = {};

  if (!obj.content) {
  	this.objects(obj, data, opts);
  } else {
    var name = obj.name || obj.path;
    o = this.normalize(name, obj, data, opts);
  	_.extend.apply(_, [this.cache].concat(o));
  }

  return this;
};


/**
 * Load multiple template objects.
 *
 * @param  {Object} `objects` Template objects.
 * @param  {Object} `options` loader options.
 * @api public
 */

loader.objects = function (objects, data, opts) {
  debug('objects', arguments);
  var o = {};

  _.forIn(objects, function(value, key) {
    if (utils.typeOf(value) === 'object' && value.hasOwnProperty('content')) {
    	o = this.normalize(key, value, data, opts);
    } else if (utils.typeOf(value) === 'string') {
      value = {content: value};
      o[key] = this.normalize(key, value, data, opts);
    } else {
      throw new Error('Loader#object cannot normalize:', value);
    }
    this.flatten(o[key]);

    _.extend.apply(_, [this.cache].concat(o));
  }.bind(this));

  return this;
};


/**
 * Call `load` for each item in the array.
 *
 * @param  {Object} `patterns` Glob patterns or array of filepaths.
 * @param  {Object} `options` Additional options to pass
 * @return {Array}  a list of files as Vinyl objects
 * @api public
 */

loader.normalize = function (key, file, data, opts) {
  file = _.extend({}, file);
  var o = {};

  o[key] = this.parse(file.content, opts);

  o[key].data = _.extend({}, file, o[key].data, data);
  _.extend(o[key].data, o[key].data.data);
  _.extend(o[key].data, o[key].data.locals);
  o[key].path = o[key].data.path || key;
  o[key].data = _.omit(o[key].data, ['original', 'locals', 'data', 'content']);
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

loader.array = function (patterns, locals) {
  debug('array', arguments);

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
 * @param  {Object} `locals` Locals or loader options.
 * @return {*}
 * @api public
 */

loader.function = function (fn, locals) {
  debug('function', arguments);

  var helper = fn();
  if (utils.typeOf(helper) === 'object') {
    return helper;
  }
  return this.load(helper, locals);
};


/**
 * Resolve modules by `name` and require them. `name` can
 * be a module name, filepath or glob pattern.
 *
 * @param  {String} `name` npm module name, file path or glob pattern to resolve
 * @param  {Object} `options` Options to pass to [resolve-dep].
 * @api public
 */

loader.resolve = function (name, options) {
  debug('resolve', arguments);

  var resolved = resolve(name);
  var results = {};

  resolved.forEach(function (filepath) {
    try {
      var helper = require(filepath);
      if (utils.typeOf(helper) === 'object') {
        _.extend(results, helper);
      } else {
        _.extend(results, this.load(helper, options));
      }
    } catch(err) {
      return err;
    }
  });

  return results;
};



/**
 * Export `Loader`
 */

module.exports = loader;
