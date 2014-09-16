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



exports.siftData = function (o, dataKey, props) {
  if (typeof dataKey !== 'string') {
    props = dataKey;
    dataKey = 'locals';
  }

  var notroot = _.omit(o, props);
  var root = _.pick(o, props);

  root[dataKey] = _.extend({}, notroot, o[dataKey]);
  return root;
};



/**
 * Utility for "aggregating" values for `key`, which might
 * exist on (or as) more than one object in the given
 * `args`.
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
 * @param  {Array} `args` The actual arguments to inspect.
 * @param  {Array|String} `omit` Properties to omit from the resulting object.
 * @return {String}
 */

exports.aggregateValues = function (targetKey, argIndex, args, omit) {
  if (!args || !args.length) {
    return {};
  }

  var o = {};

  if (typeof argIndex !== 'number') {
    omit = args;
    args = argIndex;
    argIndex = null;
  }

  args = args.filter(Boolean);
  var argsLen  = args.length;

  // When the args is the same length as `argIndex - 1`, assume that `targetKey`
  // is the actual object (rather than a property on the object)
  if (argIndex && argIndex === argsLen) {
    var value = args[argIndex - 1];

    if (isObject(value)) {
      _.extend(o, value);
    }
  }

  if (argIndex && argIndex < argsLen) {
    for (var idx = 0; idx < argsLen; idx++) {
      var value = args[idx];
      if (argIndex >= idx) {
        if (isObject(value)) {
          _.extend(o, value);
        } else if (isString(value) || isArray(value)) {
          o.path = o.path || value;
        }
      } else {
        break;
      }
    }
  }

  // Look for `targetKey` on each object in args
  for (var i = 0; i < argsLen; i++) {
    var value = exports.findProperty(args[i], targetKey);
    _.defaults(o, value);
    if (typeof argIndex === 'number' && i >= argIndex) {
      break;
    }
  }

  if (omit) {
    return _.omit(o, omit);
  }

  return o;
};



exports.findProperty = function (value, key) {
  var o = {};

  if (value && isObject(value)) {
    if (_.any(value, key) && !!_.detect(value, key)[key]) {
      o = _.detect(value, key)[key];
    } else if (value.hasOwnProperty(key)) {
      o = value[key];
    }
  }

  debug('findProperty: %s', o);
  return o;
};


exports.isNormalized = function(o) {
  return !!_.detect(o, '_normalized') ? true : !!_.detect(o, 'options')
    && !!_.detect(o, 'options').options
    && _.detect(o, 'options').options._normalized;
};


exports.moveDifference = function (value, target, ignoreKeys) {
  var props = _.difference(_.keys(value), ignoreKeys);

  var o = {};
  o[target] = {};

  if (exports.isNormalized(value)) {
    return value;
  }

  props.forEach(function (prop) {
    o[target][prop] = value[prop];
    o[target].options = _.extend({}, o[target].options, {
      _normalized: true
    });
  });

  _.extend(o, _.omit(value, props));
  return o;
};

exports.normalize = function(obj, target, ignoreKeys) {
  var keys = Object.keys(obj);
  var o = {};

  if (exports.isNormalized(obj)) {
    return obj;
  }

  keys.forEach(function(key) {
    var value = obj[key];
    o[key] = exports.moveDifference(value, target, ignoreKeys);
  });

  return o;
};
