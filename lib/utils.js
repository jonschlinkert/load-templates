/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var arr = require('arr');
var typeOf = require('kind-of');
var forOwn = require('for-own');
var omit = require('object.omit');
var pick = require('object.pick');

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
 * Extend the target `obj` with properties from other
 * objects.
 *
 * @param  {Object}  `obj` The target object. Pass an empty object to shallow clone.
 * @param  {Objects}
 * @return {Object}
 */

utils.extend = function extend(o) {
  var args = [].slice.call(arguments, 1);
  if (o == null) {
    return {};
  }
  var len = args.length;

  for (var i = 0; i < len; i++) {
    var obj = args[i];

    for (var key in obj) {
      if (hasOwn(obj, key)) {
        copy(o, obj);
      }
    }
  }
  return o;
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
 * Omit `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.baseOmit = function baseOmit(o, keys) {
  return o == null ? {} : omit(o, keys);
};

/**
 * Pick `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.basePick = function basePick(o, keys) {
  return o == null ? {} : pick(o, keys);
};

/**
 * Pick `utils.rootKeys` from `object`.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickRoot = function pickRoot(o) {
  return utils.basePick(o, utils.rootKeys);
};

/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickLocals = function pickLocals(o) {
  var root = utils.baseOmit(o, utils.rootKeys);
  return utils.extend({}, root, pick(o, 'locals'));
};

/**
 * Pick `options` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickOptions = function pickOptions(o) {
  return utils.basePick(o, 'options');
};

/**
 * Omit `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.omitLocals = function omitLocals(o) {
  return utils.baseOmit(o, 'locals');
};

/**
 * Omit the `options` property from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.omitOptions = function omitOptions(o) {
  return utils.baseOmit(o, ['options']);
};

/**
 * Omit root properties from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.omitRoot = function omitRoot(o) {
  return utils.baseOmit(o, utils.rootKeys);
};

/**
 * Extend the target `obj` with properties from other
 * objects.
 *
 * ```js
 * utils.basePick(o, 'options');
 *
 *
 * @param  {Object}  `obj` The target object. Pass an empty object to shallow clone.
 * @param  {Objects}
 * @return {Object}
 */

var flattenDeep = utils.flattenDeep = function flattenDeep(prop, objects) {
  var args = [].slice.call(arguments, 1);
  var len = args.length;
  var o = {};

  for (var i = 0; i < len; i++) {
    flatten(o, args[i], prop);
  }
  return o;
};

function flatten (o, obj, prop) {
  forOwn(obj, function (value, key, obj) {
    if (key === prop) {
      copy(o, value);
    } else if (isObject(value)) {
      if (hasOwn(value[prop], prop)) {
        copy(o, flattenDeep(prop, value[prop]));
      } else if (hasOwn(value, prop)) {
        copy(o, value[prop]);
      }
    } else {
      o[key] = value;
    }
  });
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
  return utils.omitLocals(utils.omitRoot(locals), 'locals');
};

/**
 * Flatten nested `options` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.flattenOptions = function flattenOptions(obj) {
  var options = utils.pickOptions(obj);
  copy(obj, options.options);
  obj = utils.omitRoot(obj);
  return utils.omitOptions(obj, 'options');
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

utils.siftProps = function siftProps(value, locals) {
  var objects = arr.objects(arguments);
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

function isString(val) {
  return typeOf(val) === 'string';
}

function isObject(val) {
  return typeOf(val) === 'object';
}

function isFunction(val) {
  return typeOf(val) === 'function';
}

function hasOwn(o, prop) {
  return o && {}.hasOwnProperty.call(o, prop);
}