/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var deepPick = require('deep-pick');
var extend = require('mixin-deep');
var hasAny = require('has-any');
var isEmpty = require('is-empty');
var omit = require('omit-keys');
var omitEmpty = require('omit-empty');
var pick = require('object-pick');
var reduce = require('reduce-object');
var slice = require('array-slice');
var uniqueId = require('uniqueid');
var rootKeys = require('./root-keys');


/**
 * Utility for returning the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*}
 */

var typeOf = exports.typeOf = function(val) {
  return {}.toString.call(val).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};

var isString = exports.isString = function(val) {
  return exports.typeOf(val) === 'string';
};

var isObject = exports.isObject = function(val) {
  return exports.typeOf(val) === 'object';
};


/**
 * Omit `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var baseOmit = exports.baseOmit = function(o, keys) {
  return (o == null) ? {} : omit(o, keys);
};


/**
 * Pick `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var basePick = exports.basePick = function(o, keys) {
  return (o == null) ? {} : pick(o, keys);
};


/**
 * Pick `rootKeys` from `object`.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var pickRoot = exports.pickRoot = function(o) {
  return basePick(o, rootKeys);
};


/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var pickLocals = exports.pickLocals = function(o) {
  var root = baseOmit(o, rootKeys);
  return extend({}, root, pick(o, 'locals'));
};


/**
 * Pick `options` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var pickOptions = exports.pickOptions = function(o) {
  return pick(o, 'options');
};


/**
 * Omit `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var omitLocals = exports.omitLocals = function(o) {
  return baseOmit(o, 'locals');
};


/**
 * Omit the `options` property from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var omitOptions = exports.omitOptions = function(o) {
  return baseOmit(o, ['options']);
};


/**
 * Omit root properties from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var omitRoot = exports.omitRoot = function(o) {
  return baseOmit(o, rootKeys);
};


/**
 * Flatten nested `locals` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.flattenLocals = function(obj) {
  var locals = pickLocals(obj);
  var o = extend({}, locals, locals.locals);
  return omitLocals(omitRoot(o), 'locals');
};


/**
 * Flatten nested `options` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.flattenOptions = function(obj) {
  var options = pickOptions(obj);
  var opts = extend({}, obj, options.options);
  return omitOptions(omitRoot(opts), 'options');
};


/**
 * Generate a unique id to be used for caching unidentified
 * tempalates. (not used currently)
 *
 * @param  {Object} `options`
 * @return {Object}
 */

exports.generateId = function(options) {
  var opts = options || {};

  return opts.id ? opts.id : uniqueId({
    prefix: opts.prefix || '__id__',
    append: opts.append || ''
  });
};


/**
 * Generate the key to be used for caching an unidentified template.
 * (Not used currently).
 *
 * @param  {*} `patterns`
 * @param  {Object} `locals`
 * @param  {Object} `opts`
 * @return {Object}
 */

exports.generateKey = function(patterns, locals, opts) {
  var key = exports.generateId(opts);

  if (opts && opts.uniqueid && typeof opts.uniqueid === 'function') {
    key = opts.uniqueid(patterns, opts);
  }

  var o = {};
  var value = {value: patterns, locals: locals, options: opts.options};
  o[key] = omitEmpty(value);

  return o;
};


/**
 * Recursively flatten the specified object to the
 * root of the given `object`.
 *
 * @param  {Object} `object`
 * @param  {String} `prop`
 * @return {Object}
 */

function flat(obj, key) {
  var opts = deepPick(obj, key)[key];
  extend(obj, opts);
  return baseOmit(obj, key);
}

exports.flattenProp = function(o, prop) {
  if (isObject(o)) {
    if (o.hasOwnProperty(prop)) {
      return flat(o, prop);
    } else {
      return reduce(o, function (acc, value, key) {
        if (isObject(value)) {
          acc[key] = flat(value, prop);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
    }
  } else {
    return o;
  }
};


/**
 * Extend the `locals` property on the given object with
 * any nested `locals` properties, and any non-`rootKeys`
 * properties.
 *
 * @param  {Object} `value`
 * @return {Object} Return a new object with locals sifted.
 */

exports.siftLocals = function(value) {
  if (value == null) {
    return {};
  }

  if (Object.keys(value).length === 0) {
    return value;
  }

  var loc = exports.pickLocals(value);
  var o = exports.pickRoot(value);

  extend(loc, o.locals);
  o.locals = loc;
  return o;
};



/**
 * Return the index of the first value in the `array`
 * with the given native `type`.
 *
 * @param  {*} `type`
 * @param  {Number} `arr`
 * @return {Number} Index of the first value with a matching `type`.
 */

exports.firstIndexOfType = function(type, arr) {
  var len = arr.length >>> 0;
  var val = null;

  for (var i = 0; i < len; i++) {
    if (typeOf(arr[i]) === type) {
      val = i;
      break;
    }
  }
  return val;
};


/**
 * Return the first value in the `array` with the
 * given native `type`.
 *
 * @param  {*} `type`
 * @param  {Number} `arr`
 * @return {Number} Index of the first value with a matching `type`.
 */

exports.firstOfType = function(type, arr) {
  var len = arr.length >>> 0;
  var val = null;

  for (var i = 0; i < len; i++) {
    if (typeOf(arr[i]) === type) {
      val = arr[i];
      break;
    }
  }
  return val;
};


exports.argsOfType = function(type, args) {
  var first = exports.firstIndexOfType(type, args);
  if (first == null) {
    return null;
  }

  var arr = slice(args, first, args.length);

  return arr.filter(function (item) {
    return exports.typeOf(item) === type;
  });
};


/**
 * Figure out what is _intended_ to be `options` versus `locals`.
 *
 * @param  {Object} `value`
 * @param  {Object} `locals`
 * @param  {Object} `options`
 * @return {Object}
 */

exports.siftProps = function(value, locals, options) {
  var args = [].slice.call(arguments);
  var first = exports.firstIndexOfType('object', args);
  var diff = (args.length - first) >>> 0;

  var locs = {};
  var opts = {};
  var o = {};

  locs = args[first] || {};
  opts = args[first + 1] || {};

  if (diff <= 1 && !!args[first]) {
    opts = args[first].options;
  }

  var val;
  if (hasAny(locs, ['path', 'content'])) {
    val = deepPick(locs, 'locals')['locals'];
    if (!isEmpty(val)) {
      locs = val;
    }
  }

  if (hasAny(opts, ['path', 'content'])) {
    opts = deepPick(opts, 'options')['options'];
  }

  if (locs != null) {
    extend(opts, locs.options);
    o.locals = omit(locs.locals || locs, ['options']);
  }

  if (opts != null) {
    o.options = opts.options || opts;
  }

  return o;
};
