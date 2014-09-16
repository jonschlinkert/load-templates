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
  options = this.extractOptions(key, value, locals, options);
  locals = this.extractLocals(key, value, locals, options, true);

  if (utils.isObject(key)) {
    value = {content: this.pickContent(key, value)};
    key = this.pickPath(key, value);
  }

  var opts = _.extend({}, this.options, options);
  var name = this.renameKey(key, opts);

  this.set(name, this.normalize(key, value, locals, options));
  return this.cache;
};

Loader.prototype.loadPlural = function (patterns, locals, options) {
  if (utils.isObject(patterns) && patterns.hasOwnProperty('path')) {
    return this.loadSingle(patterns, locals);
  }

  patterns = !Array.isArray(patterns) ? [patterns] : patterns;
  var data = this.extractLocals(patterns, locals, options, true);

  var opts = _.extend({}, this.options, options);
  this.reduceFiles(patterns, data, opts);
  return this.cache;
};


Loader.prototype.detectString = function (lookup, key, value, options) {
  var args = _.initial([].slice.call(arguments, 1));
  if (utils.typeOf(value) === 'undefined') {
    args = args.filter(Boolean);
  }
  var opts = _.extend({}, options);
  var re = opts.re;

  if (utils.isString(key) && (args.length === 1 || utils.isObject(value))) {

    if (value && value.hasOwnProperty('path')) {
      return value.path;
    } else {
      return key;
    }

  } else if (utils.isObject(value) && value.hasOwnProperty(lookup)) {
    return value[lookup];
  } else if (utils.isObject(key) && key.hasOwnProperty(lookup)) {
    return key[lookup];
  } else if (utils.isObject(key) && _.keys(key).length === 1) {

    if (_.any(key, lookup)) {
      return _.find(key, lookup)[lookup];
    } else if (re ? re.test(_.findKey(key)) : !!_.findKey(key)) {
      return _.findKey(key);
    } else {
      throw new Error('Could not detect `' + lookup + '`.');
    }
  }
};

Loader.prototype.pickPath = function (key, value, re) {
  if (utils.isString(key) && utils.isString(value)) {
    return key;
  } else {
    return this.detectString('path', key, value, {
      re: re || /[\.\\]/
    });
  }
};


Loader.prototype.pickContent = function (key, value) {
  if (utils.isString(key) && (arguments.length === 1 || utils.isObject(value))) {

    if (value && value.hasOwnProperty('content')) {
      return value.content;
    } else if (value && value.hasOwnProperty('path')) {
      return this.reduceFiles(value.path);
    } else {
      return this.reduceFiles(key);
    }

  } else if (utils.isString(key) && utils.isString(value)) {
    return value;
  } else {
    return this.detectString('content', key, value);
  }
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
  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }

  var opts = this.extractOptions(patterns, locals, options);
  opts = _.extend({}, this.options, opts);

  var files = utils.glob(patterns, options);
  debug('reduceFiles [files]: %j', files);

  return _.reduce(files, function (acc, filepath) {
    var file = utils.parse(utils.read(filepath), opts);

    file.options = options;
    file.locals = locals;
    file.path = filepath;

    var name = this.renameKey(filepath, opts);
    debug('reduceFiles [file]: %j', file);

    this.loadSingle(name, file, locals, opts);
    return acc;
  }.bind(this), this.cache);
};


Loader.prototype.reduceObjects = function (key, arr) {
  return _.reduce(arr, function (acc, value) {
    return _.extend(acc, utils.findProperty(value, key));
  }.bind(this), {});
};


Loader.prototype.extractLocals = function (key, value, locals, options) {
  var args = [].slice.call(arguments);

  if (utils.typeOf(_.last(args)) === 'boolean' && args.length === 4) {
    options = locals;
    locals = utils.isObject(value) ? value : {};
    value = utils.isObject(key) ? key : {};
    key = {};
  }

  if (locals) {
    return _.omit(locals, ['options', 'data']);
  }

  return this.reduceObjects('locals', [key, value]);
};


Loader.prototype.extractData = function (key, value, locals) {
  var data = {};

  if (locals) {
    data = _.extend({}, data, _.pick(locals, ['data']));
  }

  if (value && utils.isObject(value)) {
    data = _.extend({}, data, _.pick(value, ['data']));
  }

  if (key && utils.isObject(key)) {
    data = _.extend({}, data, _.pick(key, ['data']));
  }

  return data;
};


Loader.prototype.extractOptions = function (key, value, locals, options) {
  return options ? options : this.reduceObjects('options', [key, value, locals]);
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


Loader.prototype.normalize = function (key, value, locals, options) {
  locals = locals || {};
  var opts = _.extend({}, options, locals.options);
  var o = {};

  if (opts.normalize) {
    debug('opts.normalize: %j', arguments);
    return opts.normalize.apply(this, arguments);
  }

  if (utils.isString(value)) {
    var str = String(value);
    value = {};
    value.content = str;
    o.content = str;
  }

  if (utils.isObject(value)) {
    if (!value.hasOwnProperty('path') && utils.isString(key)) {
      o.path = key;
    }
  }

  o.locals = _.extend({}, value.locals, locals);
  o.options = opts;

  debug('normalize [value]: %j', o);
  return o;
};

module.exports = Loader;