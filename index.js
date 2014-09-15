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


Loader.prototype.set = function (key, value, locals, options) {
  debug('set: %j', arguments);

  if (utils.typeOf(value) === 'string') {
    var str = String(value);
    value = {};
    value.locals = locals || {};
    value.options = options || {};
    value.content = str;
  }

  this.cache[key] = value;
  return this;
};


Loader.prototype.get = function (key) {
  return this.cache[key];
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

  var opts = this.pickOptions(patterns, locals, options);
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

  if (utils.typeOf(value) === 'string') {
    var str = String(value);
    value = {};
    value.content = str;
    o.content = str;
  }

  if (utils.typeOf(value) === 'object') {
    if (!value.hasOwnProperty('path') && utils.typeOf(key) === 'string') {
      o.path = key;
    }
  }

  o.locals = _.extend({}, value.locals, locals);
  o.options = opts;

  debug('normalize [value]: %j', o);
  return o;
};


Loader.prototype.detectString = function (lookup, key, value, options) {
  var args = _.initial([].slice.call(arguments, 1));
  if (utils.typeOf(value) === 'undefined') {
    args = args.filter(Boolean);
  }
  var opts = _.extend({}, options);
  var re = opts.re;

  if (utils.typeOf(key) === 'string' && (args.length === 1 || utils.typeOf(value) === 'object')) {

    if (value && value.hasOwnProperty('path')) {
      return value.path;
    } else {
      return key;
    }

  } else if (utils.typeOf(value) === 'object' && value.hasOwnProperty(lookup)) {
    return value[lookup];
  } else if (utils.typeOf(key) === 'object' && key.hasOwnProperty(lookup)) {
    return key[lookup];
  } else if (utils.typeOf(key) === 'object' && _.keys(key).length === 1) {

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
  if (utils.typeOf(key) === 'string' && utils.typeOf(value) === 'string') {
    return key;
  } else {
    return this.detectString('path', key, value, {
      re: re || /[\.\\]/
    });
  }
};


Loader.prototype.pickContent = function (key, value) {
  if (utils.typeOf(key) === 'string' && (arguments.length === 1 || utils.typeOf(value) === 'object')) {

    if (value && value.hasOwnProperty('content')) {
      return value.content;
    } else if (value && value.hasOwnProperty('path')) {
      return this.reduceFiles(value.path);
    } else {
      return this.reduceFiles(key);
    }

  } else if (utils.typeOf(key) === 'string' && utils.typeOf(value) === 'string') {
    return value;
  } else {
    return this.detectString('content', key, value);
  }
};


Loader.prototype.reduceObjects = function (arr, key) {
  return _.reduce(arr, function (acc, value) {
    return _.extend(acc, utils.findProperty(value, key));
  }.bind(this), {});
};


Loader.prototype.pickLocals = function (key, value, locals, options) {
  var args = [].slice.call(arguments);

  if (utils.typeOf(_.last(args)) === 'boolean' && args.length === 4) {
    options = locals;
    locals = utils.typeOf(value) === 'object' ? value : {};
    value = utils.typeOf(key) === 'object' ? key : {};
    key = {};
  }

  if (locals) {
    return _.omit(locals, ['options', 'data']);
  }

  return this.reduceObjects([key, value], 'locals');
};


Loader.prototype.pickData = function (key, value, locals) {
  if (locals) {
    return _.pick(locals, ['data']);
  }

  return this.reduceObjects([key, value], 'data');
};


Loader.prototype.pickOptions = function (key, value, locals, options) {
  if (options) {
    return _.extend({}, options);
  }
  return this.reduceObjects([key, value, locals], 'options');
};


Loader.prototype.loadSingle = function (key, value, locals, options) {
  options = this.pickOptions(key, value, locals, options);
  locals = this.pickLocals(key, value, locals, options, true);

  if (utils.typeOf(key) === 'object') {
    value = {content: this.pickContent(key, value)};
    key = this.pickPath(key, value);
  }

  var opts = _.extend({}, this.options, options);
  var name = this.renameKey(key, opts);

  this.set(name, this.normalize(key, value, locals, options));
  return this.cache;
};



Loader.prototype.loadPlural = function (patterns, locals, options) {
  if (utils.typeOf(patterns) === 'object' && !Array.isArray(patterns) && patterns.hasOwnProperty('path')) {
    return this.loadSingle(patterns, locals);
  }

  patterns = !Array.isArray(patterns) ? [patterns] : patterns;
  var data = this.pickLocals(patterns, locals, options, true);

  var opts = _.extend({}, this.options, options);
  this.reduceFiles(patterns, data, opts);
  return this.cache;
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



module.exports = Loader;