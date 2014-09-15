'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var chalk = require('chalk');
var debug = require('debug')('load-templates');
var matter = require('gray-matter');
var glob = require('globby');
var _ = require('lodash');
var Arrange = require('arrange');


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
  Arrange.call(this, options);
  this.cache = {};
  this.defaultOptions();
}

util.inherits(Loader, Arrange);


/**
 * Initialize default options.
 *
 * @api private
 */

Loader.prototype.defaultOptions = function() {
  this.option('cwd', process.cwd());
};


Loader.prototype.set = function (key, value, locals, options) {
  debug('set: %j', arguments);

  if (typeOf(value) === 'string') {
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
 * Read the given file. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

Loader.prototype.glob = function (patterns, options) {
  debug('glob: %j', patterns);

  return glob.sync(patterns, _.extend({}, this.options, {
    nonull: false
  }, options));
};


/**
 * Read the given file. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

Loader.prototype.read = function (filepath, options) {
  var opts = _.extend({}, this.options, options);

  if (opts.read) {
    debug('opts.read: %j', filepath);
    return opts.read(filepath);
  }

  debug('read: %j', filepath);
  return fs.readFileSync(filepath, 'utf8');
};


/**
 * Parse the content of each template loaded using whatever parsing function
 * is defined on the options.
 *
 * @param  {String} `str` The string to parse.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

Loader.prototype.parse = function (str, options) {
  var opts = _.extend({}, this.options, options);

  if (opts.parse) {
    debug('opts.parse: %s', str);
    return opts.parse(str, opts);
  }

  debug('parse: %s', str);

  return matter(str, _.extend({
    autodetect: true
  }, opts));
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

  var files = this.glob(patterns, options);
  debug('reduceFiles [files]: %j', files);

  return _.reduce(files, function (acc, filepath) {
    var file = this.parse(this.read(filepath), opts);

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

  if (typeOf(value) === 'string') {
    var str = String(value);
    value = {};
    value.content = str;
    o.content = str;
  }

  if (typeOf(value) === 'object') {
    if (!value.hasOwnProperty('path') && typeOf(key) === 'string') {
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
  if (typeOf(value) === 'undefined') {
    args = args.filter(Boolean);
  }
  var opts = _.extend({}, options);
  var re = opts.re;

  if (typeOf(key) === 'string' && (args.length === 1 || typeOf(value) === 'object')) {

    if (value && value.hasOwnProperty('path')) {
      return value.path;
    } else {
      return key;
    }

  } else if (typeOf(value) === 'object' && value.hasOwnProperty(lookup)) {
    return value[lookup];
  } else if (typeOf(key) === 'object' && key.hasOwnProperty(lookup)) {
    return key[lookup];
  } else if (typeOf(key) === 'object' && _.keys(key).length === 1) {

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
  if (typeOf(key) === 'string' && typeOf(value) === 'string') {
    return key;
  } else {
    return this.detectString('path', key, value, {
      re: re || /[\.\\]/
    });
  }
};


Loader.prototype.pickContent = function (key, value) {
  if (typeOf(key) === 'string' && (arguments.length === 1 || typeOf(value) === 'object')) {

    if (value && value.hasOwnProperty('content')) {
      return value.content;
    } else if (value && value.hasOwnProperty('path')) {
      return this.reduceFiles(value.path);
    } else {
      return this.reduceFiles(key);
    }

  } else if (typeOf(key) === 'string' && typeOf(value) === 'string') {
    return value;
  } else {
    return this.detectString('content', key, value);
  }
};


Loader.prototype.filterObject = function (value, key) {
  var o = {};

  if (value && typeOf(value) === 'object') {
    if (this.hasDeepKey(value, key)) {
      o = _.find(value, key)[key];
    } else if (_.has(value, key)) {
      o = _.extend({}, value[key]);
    }
  }

  debug('filterObject: %s', o);
  return o;
};


Loader.prototype.reduceObjects = function (arr, key) {
  return _.reduce(arr, function (acc, value) {
    return _.extend(acc, this.filterObject(value, key));
  }.bind(this), {});
};


Loader.prototype.pickLocals = function (key, value, locals, options) {
  if (typeOf(_.last(arguments)) === 'boolean' && arguments.length === 4) {
    options = locals;
    locals = typeOf(value) === 'object' ? value : {};
    value = typeOf(key) === 'object' ? key : {};
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

  if (typeOf(key) === 'object') {
    value = {content: this.pickContent(key, value)};
    key = this.pickPath(key, value);
  }

  var opts = _.extend({}, this.options, options);
  var name = this.renameKey(key, opts);

  this.set(name, this.normalize(key, value, locals, options));
  return this.cache;
};



Loader.prototype.loadPlural = function (patterns, locals, options) {
  if (typeOf(patterns) === 'object' && !Array.isArray(patterns) && patterns.hasOwnProperty('path')) {
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

  if (typeOf(last) === 'boolean') {
    multiple = last;
  }

  if (multiple) {
    return this.loadPlural.apply(this, args);
  } else {
    return this.loadSingle.apply(this, args);
  }
};


/**
 * Get the type of an object.
 *
 * @param  {*} value
 * @return {*}
 * @api private
 */

function typeOf(value) {
  return Object.prototype.toString.call(value).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
}

module.exports = Loader;