/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');
var filterType = require('filter-type');
var _ = require('lodash');

/**
 * Expose `utils`
 */

var utils = module.exports;

/**
 * Expose `heuristics` on utils.
 */

utils.heuristics = require('./heuristics');

/**
 * Expose `rootKeys` on utils.
 */

utils.rootKeys = require('./root-keys');

/**
 * Pick `utils.rootKeys` from `object`.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickRoot = function pickRoot(o) {
  return _.pick(o, utils.rootKeys);
};

/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickLocals = function pickLocals(o) {
  var root = _.omit(o, utils.rootKeys);
  return _.extend({}, root, _.pick(o, 'locals'));
};

/**
 * Omit root properties from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.omitRoot = function omitRoot(o) {
  return _.omit(o, utils.rootKeys);
};

/**
 * Copy properties from object `b` onto
 * object `a`.
 *
 * @param  {Object} `object`
 * @return {Object}
 * @api private
 */

function copy(a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
}

/**
 * Extend the target `obj` with properties from other
 * objects.
 *
 * ```js
 * _.pick(o, 'options');
 *
 *
 * @param  {Object}  `obj` The target object. Pass an empty object to shallow clone.
 * @param  {Objects}
 * @return {Object}
 */

utils.flattenDeep = flattenDeep;

function flattenDeep(prop) {
  var len = arguments.length;
  var args = new Array(len - 1);
  for (var i = 0; i < len; i++) {
    args[i] = arguments[i + 1];
  }
  var j = 0, o = {};
  while (len--) {
    flattenObj(prop, args[j++], o);
  }
  return o;
}

function flattenObj(prop, arg, o) {
  if (isObject(arg)) {
    var keys = Object.keys(arg);
    var len = keys.length;
    var i = 0;

    while (len--) {
      var key = keys[i++];
      if (isObject(arg[key])) {
        _.extend(o, flattenObj(prop, arg[key], o));
      } else {
        o[key] = arg[key];
      }
    }
  }
  return o;
}


/**
 * Flatten nested `locals` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.flattenLocals = function flattenLocals(obj) {
  var locals = utils.pickLocals(obj);
  copy(locals, locals.locals);
  return _.omit(utils.omitRoot(locals), 'locals');
};

/**
 * Flatten nested `options` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.flattenOptions = function flattenOptions(obj) {
  var options = _.pick(obj, 'options');
  copy(obj, options.options);
  return _.omit(utils.omitRoot(obj), 'options');
};

/**
 * Extend the `locals` property on the given object with
 * any nested `locals` properties, and any non-`rootKeys`
 * properties.
 *
 * @param  {Object} `value`
 * @return {Object} Return a new object with locals sifted.
 */

utils.collectLocals = function collectLocals(value) {
  if (value == null) {
    return {};
  }
  var locs = utils.pickLocals(value);
  var root = utils.pickRoot(value);
  root.locals = utils.flattenLocals(locs);
  return root;
};

/**
 * Figure out what is _intended_ to be `options` versus `locals`.
 *
 * @param  {Object} `value`
 * @param  {Object} `locals`
 * @param  {Object} `options`
 * @return {Object}
 */

utils.siftProps = function siftProps(/*value, locals*/) {
  var objects = filterType(arguments, 'object');
  var locs = objects[0] || {};
  var opts = objects[1] || {};
  var root = {};

  root.options = utils.flattenOptions(opts);
  root.locals = utils.flattenLocals(locs);
  return root;
};


var has = Object.prototype.hasOwnProperty;

/**
 * Utilities for returning the native `typeof` a value.
 *
 * @api private
 */

function isObject(val) {
  return typeOf(val) === 'object';
}

function hasOwn(o, prop) {
  return o && has.call(o, prop);
}

utils.isObject = isObject;
utils.hasOwn = hasOwn;
