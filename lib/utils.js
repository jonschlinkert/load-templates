/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var chalk = require('chalk');
var deepPick = require('deep-pick');
var typeOf = require('kind-of');
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


var utils = module.exports;
extend(utils, require('array-utils'));


utils.isString = function isString(val) {
  return typeOf(val) === 'string';
};

utils.isObject = function isObject(val) {
  return typeOf(val) === 'object';
};

utils.isNumber = function isNumber(val) {
  return typeOf(val) === 'number';
};



/**
 * Omit `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var baseOmit = utils.baseOmit = function(o, keys) {
  return o == null ? {} : omit(o, keys);
};


/**
 * Pick `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var basePick = utils.basePick = function(o, keys) {
  return o == null ? {} : pick(o, keys);
};


/**
 * Pick `rootKeys` from `object`.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var pickRoot = utils.pickRoot = function(o) {
  return basePick(o, rootKeys);
};


/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var pickLocals = utils.pickLocals = function(o) {
  var root = baseOmit(o, rootKeys);
  return extend({}, root, pick(o, 'locals'));
};


/**
 * Pick `options` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var pickOptions = utils.pickOptions = function(o) {
  return basePick(o, 'options');
};


/**
 * Omit `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var omitLocals = utils.omitLocals = function(o) {
  return baseOmit(o, 'locals');
};


/**
 * Omit the `options` property from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var omitOptions = utils.omitOptions = function(o) {
  return baseOmit(o, ['options']);
};


/**
 * Omit root properties from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var omitRoot = utils.omitRoot = function(o) {
  return baseOmit(o, rootKeys);
};


/**
 * Flatten nested `locals` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

var flattenLocals = utils.flattenLocals = function(obj) {
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

var flattenOptions = utils.flattenOptions = function(obj) {
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

utils.generateId = function(options) {
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

utils.generateKey = function(patterns, locals, opts) {
  var key = utils.generateId(opts);

  if (opts && opts.uniqueid && typeof opts.uniqueid === 'function') {
    key = opts.uniqueid(patterns, opts);
  }

  var o = {};
  var value = {value: patterns, locals: locals, options: opts.options};

  o[key] = omitEmpty(value);
  return o;
};


/**
 * Extend the `locals` property on the given object with
 * any nested `locals` properties, and any non-`rootKeys`
 * properties.
 *
 * @param  {Object} `value`
 * @return {Object} Return a new object with locals sifted.
 */

utils.siftLocals = function siftLocals(value) {
  if (value == null) {
    return {};
  }

  if (Object.keys(value).length === 0) {
    return value;
  }

  var o = utils.pickRoot(value);

  var loc = utils.pickLocals(value);
  o.locals = utils.flattenLocals(loc);
  return o;
};


/**
 * Figure out what is _intended_ to be `options` versus `locals`.
 *
 * @param  {Object} `value`
 * @param  {Object} `locals`
 * @param  {Object} `options`
 * @return {Object}
 */

utils.siftProps = function siftProps(value, locals) {
  var first = utils.firstIndexOfType('object', arguments);
  var args = [].slice.call(arguments);

  var opts = args[first + 1] || {};
  var locs = args[first] || {};
  var o = {};

  opts = extend({}, opts, pickOptions(locs));
  o.options = flattenOptions(opts);
  o.locals = flattenLocals(locs);
  return o;
};
