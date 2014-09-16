'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var chalk = require('chalk');
var debug = require('debug')('load-templates');
var matter = require('gray-matter');
var glob = require('globby');
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
  this.rootKeys = ['options', 'path', 'content', 'data', 'locals'];
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


Loader.prototype.load = function () {
  var args = [].slice.call(arguments);
  var last = args[args.length - 1];
  var multiple = false;

  if (utils.typeOf(last) === 'boolean') {
    multiple = last;
  }

  if (multiple) {
    return this.loadPlural.apply(this, args);
  } else {
    return this.loadSingle.apply(this, args);
  }
};


Loader.prototype.loadSingle = function (key, value, locals, options) {
  var args = [].slice.call(arguments);
  var o = {};

  var newKey = this.findKey(key, value);
  o.path = this.findPath(key, value);
  o.content = this.findContent(key, value);
  o.locals = this.findLocals(args);

  // if the first two args are strings,
  if (utils.isString(args[0]) && utils.isString(args[1])) {
    args[2] = _.pick(args[2], 'options');
  }

  o.options = options || this.findOptions(args);

  var opts = _.extend({}, this.options, o.options);
  var name = this.renameKey(newKey, opts);

  if (!utils.isObject(o.content)) {
    this.set(name, o);
  }

  return this.cache;
};


Loader.prototype.loadPlural = function (patterns, locals, options) {
  var args = [].slice.call(arguments);

  if (utils.isObject(patterns)) {
    if (patterns.hasOwnProperty('path')) {
      return this.loadSingle(patterns, locals);
    }
    // else {
    //   // todo: load multiple objects
    // }
  }

  patterns = !Array.isArray(patterns) ? [patterns] : patterns;
  var locs = this.findLocals(args);

  var opts = _.extend({}, this.options, options);
  this.reduceFiles(patterns, locs, {options: opts});
  return this.cache;
};


Loader.prototype.aggregate = function () {
  return utils.aggregateValues.apply(this, arguments);
};

Loader.prototype.detectString = function (lookup, key, value, options) {
  var args = _.initial([].slice.call(arguments, 1));

  if (utils.typeOf(value) === 'undefined') {
    args = args.filter(Boolean);
  }

  var opts = _.extend({}, options);
  var o;

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
  var locals = this.aggregate('locals', 2, args, omissions);

  // As a last resort, if `aggregate` found nothing...
  if (locals && utils.isObject(locals) && Object.keys(locals).length === 0) {
    if (args && utils.isObject(args[0])) {
      var keys = Object.keys(args[0]);
      keys.forEach(function(key) {
        _.extend(locals, _.omit(args[0][key], this.rootKeys));
      }.bind(this));
    } else {
      locals = {};
    }
  }
  return locals;
};

Loader.prototype.findOptions = function (args, omitKeys) {
  return this.aggregate('options', 3, args, _.union(this.rootKeys, omitKeys));
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

Loader.prototype.reduceFiles = function (patterns, locals, options) {
  var args = [].slice.call(arguments);

  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }

  var opts = this.findOptions(args);
  var locs = this.findLocals(args);

  opts = _.extend({}, this.options, opts);

  var files = utils.glob(patterns, options);
  debug('reduceFiles [files]: %j', files);

  if (files.length === 0) {
    return null;
  }

  return _.reduce(files, function (acc, filepath) {
    var name = this.renameKey(filepath, opts);
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