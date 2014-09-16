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

exports.isString = function (value) {
  return typeOf(value) === 'string';
};

exports.isArray = function (value) {
  return Array.isArray(value) &&
    typeOf(value) === 'array';
};

exports.isObject = function (value) {
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
    return opts.read(filepath);
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
 * @param  {String} `argIndex` Optionally pass the index for which `key` might be defined
 *                             directly as an object, e.g. as opposed to being defined as a
 *                             property on one of the other objects/arguments.
 * @param  {String} `argsArray` The actual arguments to inspect.
 * @return {String}
 */

exports.aggregateValues = function (key, argIndex, argsArray) {
  var o = typeof argIndex === 'number' ? argsArray[argIndex] : {};

  for (var i = 0; i < argsArray.length; i++) {
    if (typeof argsArray[i] === 'object' && !Array.isArray(argsArray[i]) && argsArray[i].hasOwnProperty(key)) {
      _.defaults(o, argsArray[i][key]);
    }
    if (typeof argIndex === 'number' && i >= argIndex) {
      break;
    }
  }
  return o;
};



exports.findProperty = function (value, key) {
  var o = {};

  if (value && exports.typeOf(value) === 'object') {
    if (!!_.find(value, key) && !!_.find(value, key)[key]) {
      o = _.find(value, key)[key];
    } else if (value.hasOwnProperty(key)) {
      o = value[key];
    }
  } else {
    o[key] = value;
  }

  debug('findProperty: %s', o);
  return o;
};