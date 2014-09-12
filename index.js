'use strict';

var fs = require('fs');
var matter = require('gray-matter');
var glob = require('globby');
var _ = require('lodash');

var loader = module.exports;
var o = {};

loader.set = function (key, value) {
  if (typeof value === 'string') {
    value = {
      content: value
    };
  }
  o[key] = value;
};

loader.extend = function (obj) {
  _.extend(o, obj || {});
};

loader.get = function (key) {
  return o[key];
};

loader.load = function () {
  var args = [].slice.call(arguments);
  var last = args[args.length - 1];
  var multiple = false;

  if (typeof last === 'boolean') {
    multiple = last;
  }

  if (multiple) {
    return this.loadMultiple.apply(this, args);
  } else {
    return this.loadOne.apply(this, args);
  }
};

loader.read = function (filepath, options) {
  var opts = _.extend({}, this.options, options);
  if (opts.read) {
    return opts.read(filepath);
  }
  return fs.readFileSync(filepath, 'utf8');
};

loader.parse = function (str, options) {
  var opts = _.extend({}, this.options, options);
  if (opts.parse) {
    return opts.parse(str, opts);
  }
  return matter(str, opts);
};

loader.normalize = function (key, value, locals, options) {
  locals = locals || {};
  var opts = _.extend({}, options, locals.options);
  if (opts.normalize) {
    return opts.normalize.apply(null, arguments);
  }
  return value;
};

loader.loadOne = function (key, value, locals, options) {
  if (typeof key === 'object') {
    options = locals;
    locals = value;
    value = key;
    key = value.path;
  }
  if (!key || typeof key !== 'string') {
    throw new Error('a `path` must be defined.');
  }

  this.set(key, loader.normalize(key, value, locals, options));
  return this;
};

loader.loadMultiple = function (patterns, locals, options) {
  if (typeof patterns === 'object' && !Array.isArray(patterns) && patterns.hasOwnProperty('path')) {
    return this.loadOne(patterns);
  }
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  // array
  if (Array.isArray(patterns)) {
    _.reduce(patterns, function (acc, value, key) {
      this.loadOne(key, value, locals, options);
      return acc;
    }.bind(this), o);

  // object
  } else {
    _.reduce(patterns, function (acc, value, key) {
      if (typeof value === 'string') {
        glob.sync(value).forEach(function (fp) {
          this.loadOne(fp, this.read(fp), locals, options);
        }.bind(this));
      } else {
        this.loadOne(value, locals, options);
      }
      return acc;
    }.bind(this), o);
  }
};