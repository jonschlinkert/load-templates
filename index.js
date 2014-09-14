'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var chalk = require('chalk');
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

  // this.options = _.omit(this.options, this.optsKeys());
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

Loader.prototype.set = function (key, value) {
  if (typeOf(value) === 'string') {
    value = {content: value};
  }
  this.cache[key] = value;
  return this;
};

Loader.prototype.extendCache = function() {
  var args = [].slice.call(arguments);

  if (typeof args[0] === 'string') {
    var o = this.get(args[0]) || {};
    o = _.extend.apply(_, [o].concat(_.rest(args)));

    this.set(args[0], o);
    return this;
  }

  _.extend.apply(_, [this.cache].concat(args));
  return this;
};

Loader.prototype.get = function (key) {
  return this.cache[key];
};

Loader.prototype.load = function () {
  var args = [].slice.call(arguments);
  var last = args[args.length - 1];
  var multiple = false;

  if (typeOf(last) === 'boolean') {
    multiple = last;
  }

  if (multiple) {
    return this.loadMultiple.apply(this, args);
  } else {
    return this.loadOne.apply(this, args);
  }
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
    return opts.read(filepath);
  }

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
    return opts.parse(str, opts);
  }

  return matter(str, _.extend({
    autodetect: true
  }, opts));
};


Loader.prototype.renameKey = function (filepath, options) {
  var opts = _.extend({}, this.options, options);

  if (opts.renameKey) {
    return opts.renameKey.call(this, filepath, opts);
  }

  return path.basename(filepath, opts);
};


Loader.prototype.normalize = function (key, value, locals, options) {
  locals = locals || {};

  var opts = _.extend({}, options, locals.options);
  if (opts.normalize) {
    return opts.normalize.apply(this, arguments);
  }

  return value;
};


Loader.prototype.loadOne = function (key, value, locals, options) {
  if (typeOf(key) === 'object') {
    options = locals;
    locals = value;
    value = key;
    key = value.path;
  }

  if (!key || typeOf(key) !== 'string') {
    throw new Error('a `path` property must be defined.');
  }

  var opts = _.extend({}, this.options, options);
  var name = this.renameKey(key, opts);

  value = this.normalize(key, value, locals, options);
  if (!value.hasOwnProperty('path')) {
    value.path = key;
  }

  return this.set(name, this.normalize(key, value, locals, options));
};

Loader.prototype.loadMultiple = function (patterns, locals, options) {
  if (typeOf(patterns) === 'object' && !Array.isArray(patterns) && patterns.hasOwnProperty('path')) {
    return this.loadOne(patterns, locals);
  }

  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }

  var opts = _.extend({}, this.options, options);
  var files = glob.sync(patterns, _.extend({nonull: false}, opts));


  if (files.length) {
    _.reduce(files, function (acc, filepath) {
      var file = this.parse(this.read(filepath), opts);

      _.extend(file, {path: filepath});

      this.loadOne(filepath, file, locals, opts);
      return acc;
    }.bind(this), this.cache);
  } else {
    var msg = console.log(chalk.red('>> no files found: %j'), arguments);
    new Error(msg + files);
  }

  // return _.reduce(patterns, function (acc, value) {
  //   if (typeof value === 'string') {
  //     glob.sync(value).forEach(function (fp) {
  //       var name = this.renameKey(fp, opts);
  //       this.loadOne(name, this.read(fp), locals, options);
  //     }.bind(this));
  //   } else {
  //     var name = this.renameKey(value, opts);
  //     this.loadOne(name, locals, options);
  //   }
  //   return acc;
  // }.bind(this), this.cache);
  return this.cache;
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