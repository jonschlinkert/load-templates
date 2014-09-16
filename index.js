'use strict';

var path = require('path');
var debug = require('debug')('load-templates');
var _ = require('lodash');
var utils = require('./lib/utils');


/**
 * Create a new instance of `Loader`, optionally
 * passing default `options`.
 *
 * **Example:**
 *
 * ```js
 * var Loader = require('load-templates');
 * var templates = new Loader();
 * ```
 *
 * @param {Object} `options` Default options for front-matter and template naming.
 * @api public
 */

function Loader(options) {
  this.rootKeys = ['options', 'path', 'content', 'locals'];
  this.options = options || {};
  this.cache = {};
}


Loader.prototype.set = function (key, value) {
  debug('set: %j', arguments);

  if (utils.isString(value)) {
    value = {content: value};
  }

  this.cache[key] = value;
  return this;
};


Loader.prototype.get = function (key) {
  return this.cache[key];
};


Loader.prototype.load = function (key, value, locals, options) {
  var args = [].slice.call(arguments);
  var o = {};


  if ((args.length === 1 && utils.isString(key)) || Array.isArray(key)) {
    // there should never be four args when the first value is a file path
    var files = this.reduceFiles(key, value, locals);
    if (files) {
      return this.cache;
    }
    o.path = key;
  }

  var newKey = this.findKey(key, value);

  o.path = this.findPath(key, value);
  o.content = this.findContent(key, value);

  // If content is an object, we can assume that it's the result of
  // file paths being parsed into template objects. This means that
  // the first argument must have been glob pattern or filepath, in
  // which case there should only be three args. e.g.:
  //
  //   - the first arg is a file path or glob pattern
  //   - second arg is locals, possibly an options prop
  //   - third arg is options.
  //   - NO fourth arg;

  if (utils.isObject(o.content)) {
    o.locals = value;
    o.options = _.extend({}, locals, value && value.options);
  } else {
    o.locals = this.findLocals(args, ['data']);
    o.options = this.findOptions(args);
  }

  var opts = _.extend({}, this.options, o.options);
  var name = this.renameKey(newKey, opts);

  if (!utils.isObject(o.content)) {
    this.set(name, o);
    return this.cache;
  } else {
    return _.transform(o.content, function (acc, value, key) {
      value.locals = _.extend({}, value.locals, o.locals);
      value.options = _.extend({}, value.options, o.options);
      acc[name] = value;
    }.bind(this), this.cache);
  }
};


Loader.prototype.aggregate = function () {
  return utils.aggregateValues.apply(this, arguments);
};

Loader.prototype.detectString = function (lookup, key, value) {
  var args = _.initial([].slice.call(arguments, 1));
  var o;

  if (utils.typeOf(value) === 'undefined') {
    args = args.filter(Boolean);
  }

  if (utils.isString(key) && (args.length === 1 || utils.isObject(value))) {
    if (value && value.hasOwnProperty('path')) {
      o = value.path;
    } else {
      o = key;
    }

  } else if (utils.isObject(value) && value.hasOwnProperty(lookup)) {
    o = value[lookup];
  } else if (utils.isObject(key) && key.hasOwnProperty(lookup)) {
    o = key[lookup];
  } else if (utils.isObject(key) && _.keys(key).length === 1) {

    if (_.any(key, lookup)) {
      o = _.detect(key, lookup)[lookup];
    } else if (!!this.findKey(key)) {
      o = this.findKey(key);
    }

  } else {
    throw new Error('Could not detect `' + lookup + '`.');
  }

  return o;
};


Loader.prototype.findLocals = function (args, omitKeys) {
  var omissions = _.union(this.rootKeys, omitKeys);
  var locals = this.aggregate('locals', 2, args);

  // As a last resort, if `aggregate` found nothing...
  if (args && Object.keys(locals).length === 0) {
    locals = _.reduce(args[0], function(acc, value, key) {
      if (this.rootKeys.indexOf(key) === -1) {
        acc = utils.siftData(value, 'locals', this.rootKeys).locals;
      }
      return acc;
    }.bind(this), {});
  }

  return _.omit(locals, omissions);
};

Loader.prototype.findData = function (args, omitKeys) {
  var omissions = _.union(this.rootKeys, omitKeys);
  var data = this.aggregate('data', 2, args);

  // As a last resort, if `aggregate` found nothing...
  if (args && Object.keys(data).length === 0) {
    data = _.reduce(args[0], function(acc, value, key) {
      if (this.rootKeys.indexOf(key) === -1) {
        acc = utils.siftData(value, 'data', this.rootKeys).data;
      }
      return acc;
    }.bind(this), {});
  }

  return _.omit(data, omissions);
};


Loader.prototype.findOptions = function (args, omitKeys) {
  var omissions = _.union(this.rootKeys, omitKeys);
  return this.aggregate('options', 3, args, omissions);
};

Loader.prototype.findPath = function (key, value) {
  if (utils.isString(key) && utils.isString(value)) {
    return key;
  } else {
    return this.detectString('path', key, value);
  }
};

Loader.prototype.findContent = function (key, value, locals, options) {
  if (utils.isString(key) && (arguments.length === 1 || utils.isObject(value))) {

    if (value && value.hasOwnProperty('content')) {
      return value.content;
    } else if (value && value.hasOwnProperty('path')) {
      return this.reduceFiles(value.path, value, locals, options);
    } else {
      return this.reduceFiles(key, value, locals, options);
    }

  } else if (utils.isString(key) && utils.isString(value)) {
    return value;
  } else {
    return this.detectString('content', key, value);
  }
};

Loader.prototype.findKey = function (key, value) {
  var args = [].slice.call(arguments).filter(Boolean);

  if (utils.isObject(key)) {
    // check for `path` first
    if (key.hasOwnProperty('path')) {
      return key.path;
    } else if (_.keys(key).length === 1) {
      return _.keys(key)[0];
    }
  } else if (utils.isString(key) && utils.isString(value)) {
    return key;
  } else if (utils.isString(key) && utils.isObject(value)) {
    if (value.hasOwnProperty('path')) {
      return value.path;
    } else {
      return key;
    }
  } else if (utils.isString(key) && args.length === 1) {
    return key;
  }
};


Loader.prototype.renameKey = function (filepath, options) {
  var opts = _.extend({}, this.options, options);

  if (opts.renameKey) {
    debug('opts.renameKey: %s', filepath);
    return opts.renameKey.call(this, filepath, opts);
  }

  debug('opts.renameKey: %s', filepath);
  return path.basename(filepath, opts);
};


/**
 * Expand glob patterns, read files and return an object of
 * file objects.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

Loader.prototype.reduceFiles = function (pattern, locals, options) {
  var args = [].slice.call(arguments);

  var patterns = !Array.isArray(pattern) ? [pattern] : pattern;
  var opts = options || this.findOptions(args);
  var locs = this.findLocals(args, ['data']);

  // Extend `this.options` outside the loop
  opts = _.extend({}, this.options, opts);

  var files = utils.glob(patterns, options);
  debug('reduceFiles [files]: %j', files);

  if (files.length === 0) {
    return null;
  }

  return _.reduce(files, function (acc, filepath) {
    var name = this.renameKey.call(this, filepath, opts);
    var str = utils.read.call(this, filepath, opts);
    var o = utils.parse.call(this, str, opts);

    o.options = opts;
    o.locals = locs;
    o.path = filepath;

    debug('reduceFiles [file]: %j', o);

    acc[name] = o;
    this.set(name, o);

    return acc;
  }.bind(this), {});
};

module.exports = Loader;