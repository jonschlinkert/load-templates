/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';
// process.env.DEBUG = 'load-templates';

var fs = require('fs');
var arr = require('arr');
var path = require('path');
var extend = require('mixin-deep');
var hasAny = require('has-any');
var debug = require('debug')('load-templates');
var hasAnyDeep = require('has-any-deep');
var isObject = require('is-plain-object');
var omit = require('omit-keys');
var mapFiles = require('map-files');
var matter = require('gray-matter');
var omitEmpty = require('omit-empty');
var reduce = require('reduce-object');
var typeOf = require('kind-of');
var utils = require('./lib/utils');



function Loader(options) {
  this.options = options || {};
}

Loader.prototype.set = function(key, value) {
  debug('loader.set', key, value);
  this.options[key] = value;
};

Loader.prototype.get = function(key) {
  debug('loader.get', key);
  return this.options[key];
};

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
 * Default function for reading any files resolved.
 *
 * Pass a custom `parseFn` function on the options to change
 * how files are parsed.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {Object}
 */

Loader.prototype.readFn = function(filepath, options) {
  var opts = extend({ enc: 'utf8' }, options);

  if (opts.readFn) {
    return opts.readFn(filepath, options);
  }

  return fs.readFileSync(filepath, opts.enc);
};

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

Loader.prototype.parseFn = function(str, options) {
  var opts = extend({ autodetect: true }, options);
  if (opts.parseFn) {
    return opts.parseFn(str, options);
  }
  opts = omit(options, ['delims']);
  return matter(str, opts);
};

/**
 * Unless a custom parse function is passed, by default YAML
 * front matter is parsed from the string in the `content`
 * property.
 *
 * @param  {Object} `value`
 * @param  {Object} `options`
 * @return {Object}
 */

Loader.prototype.parseContent = function(obj, options) {
  debug('parsing content', obj);

  var o = obj || {};

  if (isString(o.content) && !o.hasOwnProperty('orig')) {
    var orig = o.content;
    o = this.parseFn(o.content, options);
    o.orig = orig;
  }
  o._parsed = true;
  return o;
};

/**
 * Map files resolved from glob patterns or file paths.
 *
 *
 * @param  {String|Array} `patterns`
 * @param  {Object} `options`
 * @return {Object}
 */

Loader.prototype.mapFilesFn = function(patterns, options) {
  debug('mapping files:', patterns);

  var files = mapFiles(patterns, extend({
    rename: this.renameKey,
    parse: this.readFn
  }, options));

  return reduce(files, function (acc, value, key) {
    debug('reducing file: %s', key, value);

    if (isString(value)) {
      value = this.parseFn(value);
      value.path = value.path || key;
    }

    value._parsed = true;
    value._mappedFile = true;
    acc[key] = value;
    return acc;
  }.bind(this), {});
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

Loader.prototype.renameKey = function(key, options) {
  debug('renaming key:', key);

  var opts = merge({}, this.options, options);
  if (opts.renameKey) {
    // return opts.renameKey(key, _.omit(opts, 'renameKey'));
    return opts.renameKey(key, opts);
  }
  return key;
};

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

Loader.prototype.normalizeFiles = function(patterns, locals, options) {
  debug('normalizing patterns: %s', patterns);

  var files = this.mapFilesFn(patterns, options);
  var locs = {};
  var opts = {};

  if (locals && isObject(locals)) {
    locs = utils.pickLocals(locals);
    opts = utils.pickOptions(locals);
  }

  if (options && isObject(options)) {
    opts = merge({}, opts, options);
  }

  if (files && Object.keys(files).length === 0) {
    return null;
  }

  return reduce(files, function (acc, value, key) {
    debug('reducing normalized file: %s', key);

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
 * {%= docs("dev-normalize-string") %}
 *
 * @param  {Object} `value` Always an object.
 * @param  {Object} `locals` Always an object.
 * @param  {Object} `options` Always an object.
 * @return {Object} Returns a normalized object.
 */

Loader.prototype.normalizeString = function(key, value, locals, options) {
  debug('normalizing string: %s', key, value);

  var args = [].slice.call(arguments, 1);
  var objects = arr.objects(arguments);
  var props = utils.siftProps.apply(this, args);
  var opts = options || props.options;
  var locs = props.locals;
  var files;
  var root = {};
  var opt = {};
  var o = {};
  o[key] = {};

  // If only `key` is defined
  if (value == null) {
    // see if `key` is a value file path
    files = this.normalizeFiles(key);
    if (files != null) {
      return files;

    // if not, add a heuristic
    } else {
      o[key]._invalidpath = true;
      o[key].path = o[key].path || key;
      return o;
    }
  }

  if ((value && isObject(value)) || objects == null) {
    debug('[value] s1o1: %s, %j', key, value);
    files = this.normalizeFiles(key, value, locals, options);
    if (files != null) {
      return files;
    } else {
      debug('[value] s1o2: %s, %j', key, value);
      root = utils.pickRoot(value);
      var loc = {};
      opt = {};

      merge(loc, utils.pickLocals(value));
      merge(loc, locals);

      merge(opt, loc.options);
      merge(opt, value.options);
      merge(opt, options);

      merge(root, utils.pickRoot(loc));
      merge(root, utils.pickRoot(opt));

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

  if (value && isString(value)) {
    debug('[value] string: %s, %s', key, value);

    root = utils.pickRoot(locals);
    o[key] = root;
    o[key].content = value;
    o[key].path = o[key].path = key;

    o[key]._s1s2 = true;
    if (objects == null) {
      return o;
    }
  }

  if (locals && isObject(locals)) {
    debug('[value] string: %s, %s', key, value);
    locs = extend({}, locs, locals.locals);
    opts = extend({}, opts, locals.options);
    o[key]._s1s2o1 = true;
  }

  if (options && isObject(options)) {
    debug('[value] string: %s, %s', key, value);
    opts = extend({}, opts, options);
    o[key]._s1s2o1o2 = true;
  }

  opt = utils.flattenOptions(opts);
  extend(opt, o[key].options);
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

Loader.prototype.normalizeShallowObject = function(value, locals, options) {
  debug('normalizing shallow object: %j', value);
  var o = utils.siftLocals(value);
  o.options = extend({}, options, o.options);
  o.locals = extend({}, locals, o.locals);
  return o;
};

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

Loader.prototype.normalizeDeepObject = function(obj, locals, options) {
  debug('normalizing deep object: %j', obj);

  return reduce(obj, function (acc, value, key) {
    acc[key] = this.normalizeShallowObject(value, locals, options);
    return acc;
  }.bind(this), {});
};

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

Loader.prototype.normalizeObject = function(o) {
  debug('normalizing object: %j', o);

  var args = [].slice.call(arguments);
  var locals1 = utils.pickLocals(args[1]);
  var locals2 = utils.pickLocals(args[2]);
  var val;

  var opts = args.length === 3 ? locals2 : {};

  if (hasAny(o, ['path', 'content'])) {
    val = this.normalizeShallowObject(o, locals1, opts);
    return createKeyFromPath(val.path, val);
  }

  if (hasAnyDeep(o, ['path', 'content'])) {
    val = this.normalizeDeepObject(o, locals1, opts);
    return createPathFromStringKey(val);
  }

  throw new Error('Invalid template object. Must' +
    'have a `path` or `content` property.');
};

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

Loader.prototype.normalizeArray = function(patterns, locals, options) {
  debug('normalizing array:', patterns);
  var opts = extend({}, locals && locals.options, options);
  return this.normalizeFiles(patterns, locals, opts);
};

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

Loader.prototype.normalizeFunction = function(fn, options) {
  var file = fn.call(this, options);
  debug('normalizing fn:', file);
  return file;
};

/**
 * Normalize base template formats.
 */

Loader.prototype.format = function() {
  var args = [].slice.call(arguments);
  debug('normalize format', args);

  switch (typeOf(args[0])) {
    case 'string':
      return this.normalizeString.apply(this, args);
    case 'object':
      return this.normalizeObject.apply(this, args);
    case 'array':
      return this.normalizeArray.apply(this, args);
    case 'function':
      return this.normalizeFunction.apply(this, args);
    default:
      return {};
    }
};

/**
 * Final normalization step to remove empty values and rename
 * the object key. By now the template should be _mostly_
 * loaderd.
 *
 * @param  {Object} `object` Template object
 * @return {Object}
 */

Loader.prototype.load = function() {
  var options = extend({}, this.options);
  debug('loader', options);

  var tmpl = this.format.apply(this, arguments);

  return reduce(tmpl, function (acc, value, key) {
    if (value && Object.keys(value).length === 0) {
      return acc;
    }
    // save the content for comparison after parsing
    var opts = {};
    extend(opts, options, value.options);
    value.ext = value.ext || path.extname(value.path);

    var parsed = this.parseContent(value, opts);

    value = merge({}, value, parsed);
    if (value.content === value.orig) {
      value = omit(value, 'orig');
    }

    if (opts.debug == null) {
      value = omit(value, utils.heuristics);
    }

    value = omitEmpty(value);
    value.content = value.content || null;
    acc[this.renameKey(key, opts)] = value;

    this.normalize(opts, acc, value, key);
    return acc;
  }.bind(this), {});
};

/**
 * Base normalize method, abstracted to make it easier to
 * pass in custom methods.
 *
 * @param  {Object} `options`
 * @param  {Object} `acc`
 * @param  {String|Object} `value`
 * @param  {String} `key`
 * @return {Object} Normalized template object.
 */

Loader.prototype.normalize = function (options, acc, value, key) {
  debug('normalize: %s, %value', key);
  if (options && options.normalize) {
    return options.normalize(acc, value, key);
  }
  acc[key] = value;
  return acc;
};

/**
 * Merge util. I'm doing it this way temporarily until
 * benchmarks are done so I can swap in a different function.
 *
 * @param  {Object} `obj`
 * @return {Object}
 * @api private
 */

function merge(o) {
  return utils.extend.apply(null, arguments);
}

/**
 * typeof utils
 *
 * @api private
 */

function isString(val) {
  return typeOf(val) === 'string';
}

/**
 * Expose `loader`
 *
 * @type {Object}
 */

module.exports = Loader;
