'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var matter = require('gray-matter');
var debug = require('debug')('load-templates:utils');
var glob = require('globby');
var _ = require('lodash');


/**
 * Get the type of an object.
 *
 * @param  {*} value
 * @return {*}
 * @api private
 */

var typeOf = exports.typeOf = function (value) {
  return Object.prototype.toString.call(value).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};

var isString = exports.isString = function (value) {
  return typeOf(value) === 'string';
};

var isArray = exports.isArray = function (value) {
  return Array.isArray(value) &&
    typeOf(value) === 'array';
};

var isObject = exports.isObject = function (value) {
  return !Array.isArray(value) &&
    typeOf(value) === 'object';
};



/**
 * ## .hasOwn
 *
 * Return true if `key` is an own, enumerable property
 * of `this.cache` or the given `obj`.
 *
 * ```js
 * config.hasOwn([key]);
 * ```
 *
 * @method hasOwn
 * @param  {String} `key` The key to lookup.
 * @param  {Object} `obj` The object to inspect.
 * @return {Boolean}
 * @api public
 */

exports.hasOwn = function(o, key) {
  return Object.prototype.hasOwnProperty.call(o, key);
};



/**
 * Read the given file. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

exports.glob = function (patterns, options) {
  debug('exports.glob: %j', patterns);

  return glob.sync(patterns, _.extend({
    nonull: false
  }, options));
};


/**
 * Read the given file. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

exports.read = function (filepath, options) {
  var opts = _.extend({}, options);

  if (opts.read) {
    debug('opts.read: %j', filepath);
    return opts.read.call(this, filepath);
  }

  debug('exports.read: %j', filepath);
  return fs.readFileSync(filepath, 'utf8');
};


/**
 * Parse the content of each template loaded using whatever parsing function
 * is defined on the options.
 *
 * @param  {String} `str` The string to parse.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

exports.parse = function (str, options) {
  var opts = _.extend({}, options);

  if (opts.parse) {
    debug('opts.parse: %s', str);
    return opts.parse(str, opts);
  }

  debug('exports.parse: %s', str);

  return matter(str, _.extend({
    autodetect: true
  }, opts));
};



/**
 * Utility for "aggregating" values for `key`, which might
 * exist on (or as) more than one object in the given
 * `argsArray`.
 *
 * For example, options might typically be passed
 * as a fourth argument to a function, but you may also
 * allow options to be defined on the `options` property
 * of the third argument. This method makes it easy to
 * get aggregate the values of either.
 *
 * @param  {String} `key` The property name to lookup.
 * @param  {Number} `argIndex` Optionally pass the index for which `key` might be defined
 *                             directly as an object, e.g. as opposed to being defined as a
 *                             property on one of the other objects/arguments.
 * @param  {Array} `argsArray` The actual arguments to inspect.
 * @param  {Array|String} `omit` Properties to omit from the resulting object.
 * @return {String}
 */

exports.aggregateValues = function (key, argIndex, argsArray, omit) {
  var args = [].slice.call(arguments);
  var o = {};

  if (!argsArray) {
    return {};
  }

  if (typeof argIndex !== 'number') {
    omit = argsArray;
    argsArray = argIndex;
    argIndex = null;
  }

  argsArray = argsArray.filter(Boolean);

  if (typeof argIndex === 'number' && argIndex < argsArray.length) {
    for (var idx = 0; idx < argsArray.length; idx++) {

      if (argIndex >= idx) {
        _.extend(o, argsArray[idx]);
      } else {
        break;
      }
    }
  }

  for (var i = 0; i < argsArray.length; i++) {
    var value = exports.findProperty(argsArray[i], key);
    _.defaults(o, value);
    if (typeof argIndex === 'number' && i >= argIndex) {
      break;
    }
  }

  if (args.length === 4) {
    return _.omit(o, args[3]);
  }

  return o;
};



exports.findProperty = function (value, key) {
  var o = {};

  if (value && isObject(value)) {
    if (_.any(value, key) && !!_.find(value, key)[key]) {
      o = _.find(value, key)[key];
    } else if (value.hasOwnProperty(key)) {
      o = value[key];
    }
  }

  debug('findProperty: %s', o);
  return o;
};