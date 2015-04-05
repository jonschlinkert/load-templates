/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var _ = require('lodash');
var typeOf = require('kind-of');
var filterType = require('filter-type');
var has = Object.prototype.hasOwnProperty;

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

utils.pickRoot = function pickRoot(o, keys) {
  return _.pick(o, utils.rootKeys.concat(keys || []));
};

/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickLocals = function pickLocals(o, keys) {
  var root = _.omit(o, utils.rootKeys.concat(keys || []));
  return _.extend({}, root, _.pick(o, 'locals'));
};

/**
 * Omit root properties from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.omitRoot = function omitRoot(o, keys) {
  return _.omit(o, utils.rootKeys.concat(keys || []));
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
 * Flatten nested `locals` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.flattenLocals = function flattenLocals(obj, keys) {
  var locals = utils.pickLocals(obj);
  copy(locals, locals.locals);
  return _.omit(utils.omitRoot(locals, keys), 'locals');
};

/**
 * Flatten nested `options` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.flattenOptions = function flattenOptions(obj, keys) {
  var options = _.pick(obj, 'options');
  copy(obj, options.options);
  return _.omit(utils.omitRoot(obj, keys), 'options');
};

/**
 * Extend the `locals` property on the given object with
 * any nested `locals` properties, and any non-`rootKeys`
 * properties.
 *
 * @param  {Object} `value`
 * @return {Object} Return a new object with locals sifted.
 */

utils.collectLocals = function collectLocals(value, keys) {
  if (value == null) return {};
  var locs = utils.pickLocals(value, keys);
  var root = utils.pickRoot(value, keys);
  root.locals = utils.flattenLocals(locs, keys);
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
