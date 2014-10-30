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
var util = require('util');
var File = require('vinyl');
var debug = require('debug')('load-templates');
var hasAny = require('has-any');
var Options = require('option-cache');
var hasAnyDeep = require('has-any-deep');
var mapFiles = require('map-files');
var matter = require('gray-matter');
var omit = require('omit-keys');
var omitEmpty = require('omit-empty');
var reduce = require('reduce-object');
var typeOf = require('kind-of');
var utils = require('./lib/utils');


/**
 * Initialize a new `Loader`
 *
 * ```js
 * var loader = new Loader();
 * ```
 *
 * @class Loader
 * @param {Object} `obj` Optionally pass an `options` object to initialize with.
 * @api public
 */

function Loader(options) {
  Options.call(this, options);
}

/**
 * Inherit `Options`
 */

util.inherits(Loader, Options);


/**
 * Rename the `key` of a template object, often a file path. By
 * default the key is just passed through unchanged.
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
    return opts.renameKey(key, omit(opts, 'renameKey'));
  }

  return key;
};


/**
 * Default function for reading any files resolved.
 *
 * Pass a custom `readFn` function on the options to change
 * how files are read.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {Object}
 */

Loader.prototype.readFn = function(filepath, options) {
  debug('reading:', filepath);

  var opts = merge({ enc: 'utf8' }, this.options, options);
  if (opts.readFn) {
    return opts.readFn(filepath, omit(opts, 'readFn'));
  }

  return fs.readFileSync(filepath, opts.enc);
};


/**
 * Return an object of files. Pass a custom `mapFiles` function
 * to change behavior.
 *
 * @param  {String} `patterns`
 * @param  {Object} `options`
 * @return {Object}
 */

Loader.prototype.mapFiles = function(patterns, locals, options) {
  debug('mapping files:', patterns);

  var opts = merge({}, this.options, options);
  if (opts.mapFiles) {
    return opts.mapFiles(patterns, locals, omit(opts, 'mapFiles'));
  }

  return mapFiles(patterns, {
    name: this.renameKey,
    read: this.readFn
  });
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
  debug('parsing:', str);

  var opts = merge({ autodetect: true }, this.options, options);
  if (opts.noparse === true) {
    return str;
  }

  if (opts.parseFn) {
    return opts.parseFn(str, omit(opts, 'parseFn'));
  }

  return matter(str, omit(options, ['delims']));
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
  debug('parsing content property', obj);
  var copy = omit(obj, ['content']);
  var o = {};

  if (isString(o.content) && !hasOwn(o, 'orig')) {
    var orig = o.content;
    o = this.parseFn(o.content, options);
    o.orig = orig;
  }

  merge(o, copy);
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

Loader.prototype.parseFiles = function(patterns, locals, options) {
  debug('mapping files:', patterns);

  var files = this.mapFiles(patterns, locals, options);

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
  options = options || {};
  locals = locals || {};

  merge(locals, locals.locals, options.locals);
  merge(options, locals.options);

  var files = this.parseFiles(patterns, locals, options);
  if (files && Object.keys(files).length === 0) {
    return null;
  }

  return reduce(files, function (acc, value, key) {
    debug('reducing normalized file: %s', key);

    value.options = utils.flattenOptions(options);
    value.locals = utils.flattenLocals(locals);
    acc[key] = value;
    return acc;
  }, {});
};


/**
 * When the first arg is an array, assume it's glob
 * patterns or file paths.
 *
 * ```js
 * loader(['a/b/c.md', 'a/b/*.md']);
 * loader(['a/b/c.md', 'a/b/*.md'], {a: 'b'}, {foo: true});
 * ```
 *
 * @param  {Object} `patterns` Template object
 * @param  {Object} `locals` Possibly locals, with `options` property
 * @return {Object} `options` Possibly options
 */

Loader.prototype.normalizeArray = function(patterns, locals, options) {
  debug('normalizing array:', patterns);
  return this.normalizeFiles(patterns, locals, options);
};


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

  // If only `value` is defined
  if (value == null) {

    // check if `key` is a file path
    files = this.normalizeFiles(key);
    if (files != null) {
      return files;

    // if not, add a heuristic
    } else {
      // If it's a glob pattern, this means it didn't expand
      // so return an empty object.
      if (/[*{}()]/.test(key)) {
        return {};
      }

      o[key]._hasPath = true;
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

      merge(root, utils.pickRoot(loc));

      merge(opt, loc.options);
      merge(opt, value.options);
      merge(opt, options);

      merge(root, utils.pickRoot(opt));

      o[key] = root;
      o[key].locals = loc;
      o[key].options = opt;

      var content = value && value.content;
      if (o[key].content == null && content != null) {
        o[key].content = content;
      }
    }
  }

  if (hasOwn(opt, '_hasPath') && opt._hasPath === false) {
    o[key].path = null;
  } else {
    o[key].path = value.path || key;
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
    merge(locs, locals.locals);
    merge(opts, locals.options);
    o[key]._s1s2o1 = true;
  }

  if (options && isObject(options)) {
    debug('[value] string: %s, %s', key, value);
    merge(opts, options);
    o[key]._s1s2o1o2 = true;
  }

  opt = utils.flattenOptions(opts);
  merge(opt, o[key].options);
  o[key].options = opt;

  locs = omit(locs, 'options');
  o[key].locals = utils.flattenLocals(locs);
  return o;
};


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
  o.options = merge({}, options, o.options);
  o.locals = merge({}, locals, o.locals);
  return o;
};


/**
 * Normalize nested templates that have the following pattern:
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
 * should be objects. The only exception is when
 * the last arg is a fucntion.
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

Loader.prototype.normalizeFunction = function(fn) {
  debug('normalizing fn:', arguments);
  return fn.apply(this, arguments);
};


/**
 * Select the template normalization function to start
 * with based on the first argument passed.
 */

Loader.prototype._format = function() {
  var args = [].slice.call(arguments);
  debug('normalize format', args);

  switch (typeOf(args[0])) {
    case 'array':
      return this.normalizeArray.apply(this, args);
    case 'string':
      return this.normalizeString.apply(this, args);
    case 'object':
      return this.normalizeObject.apply(this, args);
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
  debug('loader', options);

  var tmpl = this._format.apply(this, arguments);
  var options = this.options || {};

  return reduce(tmpl, function (acc, value, key) {
    if (value && Object.keys(value).length === 0) {
      return acc;
    }
    // Normalize the template
    this.normalize(options, acc, value, key);
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
  value.ext = value.ext || path.extname(value.path);

  var parsed = this.parseContent(value, options);
  merge(value, parsed);

  // Cleanup
  value = cleanupProps(value, options);
  value.content = value.content || null;

  // Create a vinyl file?
  if (options && options.vinyl) {
    value = toVinyl(value);
  }

  // Rename the object key
  acc[this.renameKey(key, options)] = value;
  return acc;
};

/**
 * When `options.vinyl` is true, transform the value to
 * a vinyl file.
 *
 * @param  {Object} `value`
 * @return {Object} Returns a vinyl file.
 * @api private
 */

function toVinyl(value) {
  return new File({
    contents: new Buffer(value.content),
    path: value.path,
    locals: value.locals || {},
    options: value.options || {}
  });
}

/**
 * Clean up some properties before return the final
 * normalized template object.
 *
 * @param  {Object} `template`
 * @param  {Object} `options`
 * @return {Object}
 */

function cleanupProps(template, options) {
  if (template.content === template.orig) {
    template = omit(template, 'orig');
  }
  if (options.debug == null) {
    template = omit(template, utils.heuristics);
  }
  return omitEmpty(template);
}


/**
 * Create a `path` property from the template object's key.
 *
 * If we detected a `path` property directly on the object that was
 * passed, this means that the object is not formatted as a key/value
 * pair the way we want our normalized templates.
 *
 * ```js
 * // before
 * loader({path: 'a/b/c.md', content: 'this is foo'});
 *
 * // after
 * loader('a/b/c.md': {path: 'a/b/c.md', content: 'this is foo'});
 * ```
 *
 * @param  {String} `filepath`
 * @param  {Object} `value`
 * @return {Object}
 * @api private
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
 * @param  {Object} `obj`
 * @return {Object}
 */

function createPathFromStringKey(o) {
  for (var key in o) {
    if (hasOwn(o, key)) {
      o[key].path = o[key].path || key;
    }
  }
  return o;
}

/**
 * Merge util. This is temporarily until benchmarks are done
 * so we can easily swap in a different function.
 *
 * @param  {Object} `obj`
 * @return {Object}
 * @api private
 */

function merge() {
  return utils.extend.apply(utils.extend, arguments);
}

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

function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
}


/**
 * Expose `loader`
 *
 * @type {Object}
 */

module.exports = Loader;
