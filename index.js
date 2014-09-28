/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var typeOf = require('kind-of');
var extend = require('mixin-deep');
var hasAny = require('has-any');
var arrUtils = require('array-utils');
var hasAnyDeep = require('has-any-deep');
var isObject = require('is-plain-object');
var omit = require('omit-keys');
var mapFiles = require('map-files');
var matter = require('gray-matter');
var omitEmpty = require('omit-empty');
var reduce = require('reduce-object');
var utils = require('./lib/utils');
var _ = require('lodash');


/**
 * Set heuristics to speed up normalization decisions.
 *
 * @type {Array}
 */

var heuristics = [
  '_invalidpath',
  '_mappedFile',
  '_normalizedFile',
  '_parsed',
  '_s1',
  '_s1s2',
  '_s1s2o1',
  '_s1s2o1o2',
  '_s1o1',
  '_s1o1o2',
  '_s1o1o2o3',
  '_o1',
  '_o1o2',
  '_o1o2o3'
];


/**
 * If we detected a `path` property directly on the object
 * that was passed, this means that the object is not
 * formatted with a key (as expected).
 *
 * ```js
 * // before
 * loader({path: 'a/b/c.md', content: 'this is foo'});
 *
 * // after
 * loader('a/b/c.md': {path: 'a/b/c.md', content: 'this is foo'});
 * ```
 *
 * @param  {String} `path`
 * @param  {Object} `value`
 * @return {Object}
 */

function createKeyFromPath(filepath, value) {
  var o = {};
  o[filepath] = value;
  return o;
}


/**
 * Create the `path` property from the string
 * passed in the first arg. This is only used
 * when the second arg is a string.
 *
 * ```js
 * loader('abc', {content: 'this is content'});
 * //=> normalize('abc', {path: 'abc', content: 'this is content'});
 * ```
 *
 * @param  {Object} a
 * @return {Object}
 */

function createPathFromStringKey(o) {
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      o[key].path = o[key].path || key;
    }
  }
  return o;
}


/**
 * Create the `path` property from a singular object key.
 *
 * ```js
 * loader({'a/b/d.md': {content: 'this is content'}})
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {String}
 */

function createPathFromObjectKey(key, value) {
  var o = {};
  value.path = value.path || key;
  o[key] = value;
  return o;
}


/**
 * Default function for reading any files resolved.
 *
 * Pass a custom `parseFn` function on the options to change
 * how files are parsed.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {Object}
 */

function readFn(filepath, options) {
  var opts = extend({ enc: 'utf8' }, options);

  if (opts.readFn) {
    return opts.readFn(filepath, options);
  }

  return fs.readFileSync(filepath, opts.enc);
}


/**
 * Default function for parsing any files resolved.
 *
 * Pass a custom `parseFn` function on the options to change
 * how files are parsed.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {Object}
 */

function parseFn(str, options) {
  var opts = extend({ autodetect: true }, options);

  if (opts.parseFn) {
    return opts.parseFn(str, options);
  }

  opts = omit(options, ['delims']);
  return matter(str, opts);
}


/**
 * [parseContent description]
 *
 * @param  {[type]} value
 * @param  {[type]} options
 * @return {[type]}
 */

function parseContent(obj, options) {
  var o = extend({}, obj);

  if (utils.isString(o.content) && !o.hasOwnProperty('orig')) {
    var orig = o.content;
    o = parseFn(o.content, options);
    o.orig = orig;
  }

  o._parsed = true;
  return o;
}


/**
 * Rename the key of a template object.
 *
 * Pass a custom `renameKey` function on the options to change
 * how keys are renamed.
 *
 * @param  {String} `key`
 * @param  {Object} `options`
 * @return {Object}
 */

function renameKey(key, options) {
  var opts = options || {};
  if (opts.renameKey) {
    return opts.renameKey(key, options);
  }
  return key;
}


/**
 * Map files resolved from glob patterns or file paths.
 *
 *
 * @param  {String|Array} `patterns`
 * @param  {Object} `options`
 * @return {Object}
 */

function mapFilesFn(patterns, options) {
  var files = mapFiles(patterns, extend({
    rename: renameKey,
    parse: readFn
  }, options));

  return reduce(files, function (acc, value, key) {
    if (utils.isString(value)) {
      value = parseFn(value);
      value.path = value.path || key;
    }

    value._parsed = true;
    value._mappedFile = true;
    acc[key] = value;
    return acc;
  }, {})
}


/**
 * First arg is a file path or glob pattern.
 *
 * ```js
 * loader('a/b/c.md', ...);
 * loader('a/b/*.md', ...);
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Object}
 */

function normalizeFiles(patterns, locals, options) {
  var files = mapFilesFn(patterns, options);
  var locs = {};
  var opts = {};

  if (locals && utils.isObject(locals)) {
    locs = utils.pickLocals(locals);
    opts = utils.pickOptions(locals);
  }

  if (options && utils.isObject(options)) {
    opts = _.merge({}, opts, options);
  }

  if (files && Object.keys(files).length === 0) {
    return null;
  }

  return reduce(files, function (acc, value, key) {
    extend(opts, options);

    value.options = utils.flattenOptions(opts);
    value.locals = utils.flattenLocals(locs);

    acc[key] = value;
    return acc;
  }, {});
}


/**
 * First value is a string, second value is a string or
 * an object.
 *
 *   - first arg can be a file-path
 *   - first arg can be a non-file-path string
 *   - first arg can be a glob pattern
 *   - second arg can a string
 *   - when the second arg is a string, the first arg cannot be a file path
 *   - the second can be an object
 *   - when the second arg is an object, it may _be_ locals
 *   - when the second arg is an object, it may _have_ an `options` property
 *   - the second can be an object
 *   - in this pattern, when a third arg exists, it _must be_ the options object.
 *   - when a third arg exists, the second arg may still have an options property
 *   - when a third arg exists, `options` and `locals.options` are merged.
 *
 * **Examples:**
 *
 * ```js
 * template.normalize('a/b/c.md');
 * template.normalize('a/b/c.md', 'this is content');
 * template.normalize('a/b/c.md', {content: 'this is content'});
 * template.normalize('a/b/c.md', {path: 'a/b/c.md'});
 * template.normalize('a/b/c.md', {path: 'a/b/c.md', content: 'this is content'});
 * template.normalize('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b'});
 * template.normalize('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b'}, {c: 'd'});
 * template.normalize('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b', options: {c: 'd'}});
 * template.normalize('a/b/c.md', {path: 'a/b/c.md', locals: {a: 'b'}, options: {c: 'd'}});
 * ```
 *
 * @param  {Object} `value` Always an object.
 * @param  {Object} `locals` Always an object.
 * @param  {Object} `options` Always an object.
 * @return {Object} Returns a normalized object.
 */

function normalizeString(key, value, locals, options) {
  var objects = utils.valuesOfType('object', arguments);
  var strings = utils.valuesOfType('string', arguments);

  var files;
  var args = [].slice.call(arguments, 1);
  var props = utils.siftProps.apply(utils.siftProps, args);
  var opts = options || props.options;
  var locs = props.locals;
  var val = {};

  var expectLocals = args[0];
  var o = {};
  o[key] = {};


  // If only `key` is defined
  if (value == null) {
    // see if `key` is a value file path
    files = normalizeFiles(key);
    if (files != null) {
      return files;

    // if not, add a heuristic
    } else {
      o[key]._invalidpath = true;
      o[key].path = o[key].path || key;
      return o;
    }
  }

  if ((value && utils.isObject(value)) || objects == null) {
    files = normalizeFiles(key, value, locals, options);
    if (files != null) {
      return files;
    } else {

      var root = utils.pickRoot(value);
      var loc = {};
      var opt = {};

      loc = _.merge({}, loc, utils.pickLocals(value));
      loc = _.merge({}, loc, locals);

      opt = _.merge({}, opt, loc.options);
      opt = _.merge({}, opt, value.options);
      opt = _.merge({}, opt, options);

      _.merge(root, utils.pickRoot(loc));
      _.merge(root, utils.pickRoot(opt));

      o[key] = root;
      o[key].locals = loc;
      o[key].options = opt;
      o[key].path = value.path || key;

      var content = value && value.content;
      if (o[key].content == null && content != null) {
        o[key].content = content;
      }
    }
  }

  if (value && utils.isString(value)) {
    var root = utils.pickRoot(locals);
    o[key] = root;
    o[key].content = value;
    o[key].path = o[key].path = key;

    o[key]._s1s2 = true;
    if (objects == null) {
      return o;
    }
  }

  // TODO: when would this happen?
  if (locals && utils.isObject(locals)) {
    o[key]._s1s2o1 = true;
  }

  // TODO: when would this happen?
  if (options && utils.isObject(options)) {
    o[key]._s1s2o1o2 = true;
  }

  var opt = utils.flattenOptions(opts);
  opt = extend({}, opt, o[key].options);
  o[key].options = opt;

  locs = omit(locs, 'options');
  o[key].locals = utils.flattenLocals(locs);
  return o;
}


/**
 * Normalize objects that have `rootKeys` directly on
 * the root of the object.
 *
 * **Example**
 *
 * ```js
 * {path: 'a/b/c.md', content: 'this is content.'}
 * ```
 *
 * @param  {Object} `value` Always an object.
 * @param  {Object} `locals` Always an object.
 * @param  {Object} `options` Always an object.
 * @return {Object} Returns a normalized object.
 */

function normalizeShallowObject(value, locals, options) {
  var o = utils.siftLocals(value);
  o.options = extend({}, options, o.options);
  o.locals = extend({}, locals, o.locals);
  return o;
}


/**
 * Normalize nested templates that have the following pattern:
 *
 * ```js
 * => {'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'}}
 * ```
 * or:
 *
 * ```js
 * { 'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.'},
 *   'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.'},
 *   'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'} }
 *```
 */

function normalizeDeepObject(obj, locals, options) {
  return reduce(obj, function (acc, value, key) {
    acc[key] = normalizeShallowObject(value, locals, options);
    return acc;
  }, {});
}


/**
 * When the first arg is an object, all arguments
 * should be objects.
 *
 * ```js
 * loader({'a/b/c.md', ...});
 *
 * // or
 * loader({path: 'a/b/c.md', ...});
 * ```
 *
 * @param  {Object} `object` Template object
 * @param  {Object} `locals` Possibly locals, with `options` property
 * @return {Object} `options` Possibly options
 */

function normalizeObject(o) {
  var args = [].slice.call(arguments);
  var locals1 = utils.pickLocals(args[1]);
  var locals2 = utils.pickLocals(args[2]);
  var val;


  var opts = args.length === 3 ? locals2 : {};

  if (hasAny(o, ['path', 'content'])) {
    val = normalizeShallowObject(o, locals1, opts);
    return createKeyFromPath(val.path, val);
  }

  if (hasAnyDeep(o, ['path', 'content'])) {
    val = normalizeDeepObject(o, locals1, opts);
    return createPathFromStringKey(val);
  }

  throw new Error('Invalid template object. Must' +
    'have a `path` or `content` property.');
}


/**
 * When the first arg is an array, assume it's glob
 * patterns or file paths.
 *
 * ```js
 * loader(['a/b/c.md', 'a/b/*.md']);
 * ```
 *
 * @param  {Object} `patterns` Template object
 * @param  {Object} `locals` Possibly locals, with `options` property
 * @return {Object} `options` Possibly options
 */

function normalizeArray(patterns, locals, options) {
  var opts = extend({}, locals && locals.options, options);
  return normalizeFiles(patterns, locals, opts);
}


/**
 * When the first arg is an array, assume it's glob
 * patterns or file paths.
 *
 * ```js
 * loader(['a/b/c.md', 'a/b/*.md']);
 * ```
 *
 * @param  {Object} `patterns` Template object
 * @param  {Object} `locals` Possibly locals, with `options` property
 * @return {Object} `options` Possibly options
 */

function normalizeFn(fn, options) {
  var file = fn.call(null, options);
  return file;
}


/**
 * Normalize base template formats.
 */

function normalizeFormat() {
  var args = [].slice.call(arguments);

  switch (typeOf(args[0])) {
  case 'string':
    return normalizeString.apply(null, args);
  case 'object':
    return normalizeObject.apply(null, args);
  case 'array':
    return normalizeArray.apply(null, args);
  case 'function':
    return normalizeFn.apply(null, args);
  default:
    return {};
  }
}


/**
 * Final normalization step to remove empty values and rename
 * the object key. By now the template should be _mostly_
 * loaderd.
 *
 * @param  {Object} `object` Template object
 * @return {Object}
 */

var loader = function (options) {
  options = extend({}, options);

  return function(obj) {
    obj = normalizeFormat.apply(null, arguments);

    return reduce(obj, function (acc, value, key) {
      if (value && Object.keys(value).length === 0) {
        return acc;
      }

      // save the content for comparison after parsing
      var opts = {};

      extend(opts, options, value.options);
      value.ext = value.ext || path.extname(value.path);

      var parsed = parseContent(value, opts);
      value = _.merge({}, value, parsed);

      if (value.content === value.orig) {
        value = omit(value, 'orig');
      }

      if (opts.debug == null) {
        value = omit(value, heuristics);
      }

      value = omitEmpty(value);
      acc[renameKey(key, opts)] = value;

      loader.normalize(opts, acc, value, key);
      return acc;
    }, {});
  };
};


loader.normalize = function (options, acc, value, key) {
  if (options && options.normalize) {
    return options.normalize(acc, value, key);
  }

  acc[key] = value;
  return acc;
};

loader.valueOnly = function (options) {
  var fn = loader(options);

  return function(obj) {
    return reduce(fn(obj), function(acc, value, key) {
      value.ext = value.ext || path.extname(value.path);
      return value;
    }, {});
  };
};


/**
 * Expose utils
 */

loader.generateKey = utils.generateKey;
loader.generateId = utils.generateId;


/**
 * Expose `loader`
 *
 * @type {Object}
 */

module.exports = loader;