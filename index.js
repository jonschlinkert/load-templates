/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var extend = require('mixin-deep');
var hasAny = require('has-any');
var hasAnyDeep = require('has-any-deep');
var isObject = require('is-plain-object');
var mapFiles = require('map-files');
var matter = require('gray-matter');
var omitEmpty = require('omit-empty');
var reduce = require('reduce-object');
var rootKeys = require('./lib/root-keys');
var utils = require('./lib/utils');


/**
 * Extend the `locals` property on the given object with
 * any nested `locals` properties, and any non-`rootKeys`
 * properties.
 *
 * @param  {Object} `value`
 * @return {Object} Return a new object with locals sifted.
 */

function siftLocals(value) {
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
}


/**
 * If we detected a `path` property directly on the object
 * that was passed, this means that the object is not
 * formatted with a key (as expected).
 *
 * ```js
 * // before
 * normalize({path: 'a/b/c.md', content: 'this is foo'});
 *
 * // after
 * normalize('a/b/c.md': {path: 'a/b/c.md', content: 'this is foo'});
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
 * normalize('abc', {content: 'this is content'});
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
 * normalize({'a/b/d.md': {content: 'this is content'}})
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
 * Default function to be used for reading and parsing
 * any files resolved.
 *
 * Pass a custom `parseFn` function on the options to change
 * how files are parsed.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {Object}
 */

function parseFn(filepath, options) {
  var defaults = {autodetect: true, enc: 'utf8'};
  var opts = extend(defaults, options);

  if (opts.parseFn) {
    return opts.parseFn(filepath, options);
  }

  return matter.read(filepath, opts);
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
  return mapFiles(patterns, extend({
    rename: renameKey,
    parse: parseFn
  }, options));
}


/**
 * First arg is a file path or glob pattern.
 *
 * ```js
 * normalize('a/b/c.md', ...);
 * normalize('a/b/*.md', ...);
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Object}
 */

function normalizeFiles(patterns, locals, options) {
  var files = mapFilesFn(patterns, options);

  options = extend({}, options);
  locals = extend({}, locals);

  if (Object.keys(files).length === 0) {
    return utils.generateKey(patterns, locals, options);
  }

  return reduce(files, function (acc, value, key) {
    value.options = extend({}, value.options, locals.options, options);
    value.locals = extend({}, value.locals, utils.omitOptions(locals));

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
  var args = [].slice.call(arguments);
  var len = args.length;

  var objects = utils.argsOfType('object', arguments);
  var strings = utils.argsOfType('string', arguments);

  var args = [].slice.call(arguments, 1);
  var props = utils.siftProps.apply(utils.siftProps, args);
  var opts = options || props.options;
  var locs = props.locals;
  var o = {};


  if (strings && strings.length === 1) {
    // console.log(chalk.cyan('one: %j'), strings);

  }

  if (strings && strings.length === 2) {
    // console.log(chalk.cyan.bold('two: %j'), strings);
    opts = utils.flattenProp(opts, 'options');
    o[key] = {path: key, content: value, locals: locs, options: opts};
    return o;
  }

  if (objects == null) {
    // console.log(chalk.gray('zero objects'));

  }

  if (objects && objects.length === 1) {
    // console.log(chalk.magenta('one: %j'), objects);

  }

  if (objects && objects.length === 2) {
    // console.log(chalk.magenta.bold('two: %j'), objects);
  }


  // Second value === 'string'
  if (utils.isString(value)) {
    opts = utils.flattenProp(opts, 'options');
    o[key] = {path: key, content: value, locals: locs, options: opts};
    return o;

  }

  // Second value === 'object'
  if (isObject(value) && hasAny(value, ['path', 'content'])) {
    value = siftLocals(value);
    value.options = opts;
    return createPathFromObjectKey(key, value);
  }

  return normalizeFiles(key, value, locals, options);
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
  var o = siftLocals(value);
  o.locals = extend({}, locals, o.locals);
  o.options = extend({}, options, o.options);
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
 * normalize({'a/b/c.md', ...});
 *
 * // or
 * normalize({path: 'a/b/c.md', ...});
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
 * normalize(['a/b/c.md', 'a/b/*.md']);
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
 * Normalize base template formats.
 */

function normalizeFormat() {
  var args = [].slice.call(arguments);

  switch (utils.typeOf(args[0])) {
  case 'string':
    return normalizeString.apply(null, args);
  case 'object':
    return normalizeObject.apply(null, args);
  case 'array':
    return normalizeArray.apply(null, args);
  default:
    return args;
  }
}


/**
 * Final normalization step to remove empty values and rename
 * the object key. By now the template should be _mostly_
 * normalized.
 *
 * @param  {Object} `object` Template object
 * @return {Object}
 */

module.exports = function (options) {
  return function(o) {
    o = normalizeFormat.apply(null, arguments);

    return reduce(o, function (acc, value, key) {
      if (Object.keys(value).length === 0) {
        return acc;
      }

      value = omitEmpty(value);
      var opts = extend({}, options, value.options);

      acc[renameKey(key, opts)] = value;
      return acc;
    }, {});
  };
};