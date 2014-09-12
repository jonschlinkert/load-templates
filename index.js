'use strict';

var fs = require('fs');
var path = require('path');
var matter = require('gray-matter');
var glob = require('globby');
var _ = require('lodash');


function Loader(cache) {
  this.cache = cache || {};
}

Loader.prototype.set = function (key, value) {
  if (typeof value === 'string') {
    value = {
      content: value
    };
  }
  this.cache[key] = value;
  return this;
};

Loader.prototype.extend = function (obj) {
  _.extend(this.cache, obj || {});
  return this;
};

Loader.prototype.get = function (key) {
  return this.cache[key];
};

Loader.prototype.load = function () {
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

Loader.prototype.read = function (filepath, options) {
  var opts = _.extend({}, this.options, options);
  if (opts.read) {
    return opts.read(filepath);
  }
  return fs.readFileSync(filepath, 'utf8');
};

Loader.prototype.parse = function (str, options) {
  var opts = _.extend({}, this.options, options);
  if (opts.parse) {
    return opts.parse(str, opts);
  }
  return matter(str, opts);
};

Loader.prototype.rename = function (filepath, options) {
  var opts = _.extend({}, this.options, options);
  if (opts.rename) {
    return opts.rename(filepath);
  }
  return path.basename(filepath);
};

Loader.prototype.normalize = function (key, value, locals, options) {
  locals = locals || {};
  var opts = _.extend({}, options, locals.options);
  if (opts.normalize) {
    return opts.normalize.apply(null, arguments);
  }
  return value;
};

Loader.prototype.loadOne = function (key, value, locals, options) {
  if (typeof key === 'object') {
    options = locals;
    locals = value;
    value = key;
    key = value.path;
  }

  if (!key || typeof key !== 'string') {
    throw new Error('a `path` must be defined.');
  }

  var opts = _.extend({}, this.options, options);
  var name = this.rename(key, opts);
  console.log(name);

  return this.set(key, this.normalize(name, value, locals, options));
};

Loader.prototype.loadMultiple = function (patterns, locals, options) {
  if (typeof patterns === 'object' && !Array.isArray(patterns) && patterns.hasOwnProperty('path')) {
    return this.loadOne(patterns);
  }

  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }

  var opts = _.extend({nonull: false}, this.options, options);
  console.log('patterns:', patterns);
  console.log(glob.sync(patterns, opts));

  // _.reduce(patterns, function (acc, value, key) {
  //   this.loadOne(key, value, locals, options);
  //   return acc;
  // }.bind(this), this.cache);
  // var opts = _.extend({}, this.options, options);

  // return _.reduce(patterns, function (acc, value) {
  //   if (typeof value === 'string') {
  //     glob.sync(value).forEach(function (fp) {
  //       var name = this.rename(fp, opts);
  //       this.loadOne(name, this.read(fp), locals, options);
  //     }.bind(this));
  //   } else {
  //     var name = this.rename(value, opts);
  //     this.loadOne(name, locals, options);
  //   }
  //   return acc;
  // }.bind(this), this.cache);
};


module.exports = Loader;