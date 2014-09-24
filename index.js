/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var chalk = require('chalk');
var extend = require('mixin-deep');
var hasAny = require('has-any');
var hasAnyDeep = require('has-any-deep');
var isObject = require('is-plain-object');
var omit = require('omit-keys');
var mapFiles = require('map-files');
var matter = require('gray-matter');
var omitEmpty = require('omit-empty');
var reduce = require('reduce-object');
var utils = require('./lib/utils');


/**
 * Set heuristics to speed up normalization decisions.
 *
 * @type {Array}
 */

var heuristics = [
  '_mappedFile',
  '_normalizedFile',
  '_s1',
  '_s1s2',
  '_s1s2o1',
  '_s1s2o1o2',
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

  if (o.data != null) {
    return o;
  }

  if (utils.isString(o.content)) {
    var parsed = parseFn(o.content, options);
    o = extend({}, o, parsed);
  }

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
      value.path = key;
    }

    value._mappedFile = true;
    acc[key] = value;
    return acc;
  }, {})
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

  if (files && Object.keys(files).length === 0) {
    return utils.generateKey(patterns, locals, options);
  }

  return reduce(files, function (acc, value, key) {
    var locs = utils.pickLocals(locals);
    var opts = utils.pickOptions(locals);
    extend(opts, options);

    value.options = utils.flattenOptions(opts);
    value.locals = utils.flattenLocals(locs);

    value._normalizedFile = true;
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
  var args = [].slice.call(arguments, 1);

  var objects = utils.argsOfType('object', arguments);
  var strings = utils.argsOfType('string', arguments);

  var props = utils.siftProps.apply(utils.siftProps, args);
  var opts = options || props.options;
  var locs = props.locals;
  var val = {};

  var o = {};
  o[key] = {};

  if (strings) {
    if (strings.length === 1) {
      var content = (value && value.content) || value;

      o[key].path = key;
      o[key].content = content;
      o[key].locals = locs;
      o[key].options = opts;
      o[key]._s1 = true;
    }

    if (strings.length === 2) {
      o[key] = {path: key, content: value, locals: locs, options: opts};
    }
  }

  if (objects == null) {
    // console.log(chalk.gray('zero objects'));
  } else {
    if (objects.length === 1) {
      // console.log(chalk.magenta('one: %j'), objects);
    }

    if (objects.length === 2) {
      // console.log(chalk.magenta.bold('two: %j'), objects);
    }

    if (isObject(value) && hasAny(value, ['path', 'content'])) {
      value = utils.siftLocals(value);
      value.options = opts;
      return createPathFromObjectKey(key, value);
    }
  }

  opts = utils.flattenOptions(opts);

  // Second value === 'string'
  if (utils.isString(value)) {
    o[key].options = opts;
    return o;
  }

  return normalizeFiles(key, value, locals, opts);
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

function normalizeFn(fn, options) {
  var file = fn.call(null, options);
  return file;
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
  case 'function':
    return normalizeFn.apply(null, args);
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

      var opts = {};
      var str = (value && value.content);

      extend(opts, options, value.options);
      value = parseContent(value, options);
      if (value.data != null && value.content === str) {
        value = omit(value, 'orig');
      }

      value = omit(value, heuristics);
      value = omitEmpty(value);

      acc[renameKey(key, opts)] = value;
      return acc;
    }, {});
  };
};