'use strict';

var fs = require('fs');
var matter = require('gray-matter');
var glob = require('globby');
var _ = require('lodash');


var o = {};
function load(){}

load.set = function (key, value) {
  if (typeof value === 'string') {
    value = {content: value};
  }
  o[key] = value;
};

load.extend = function (obj) {
  _.extend(o, obj || {});
  return this;
};

load.loadOne = function (key, value, locals, options) {
  if (typeof key === 'object') {
    options = locals;
    locals = value;
    value = key;
    key = value.path;
  }
  if (!key || typeof key !== 'string') {
    throw new Error('a `path` must be defined.');
  }

  this.set(key, load.normalize(key, value, locals, options));
  return this;
};

load.loadMany = function (patterns, locals, options) {
  if (typeof patterns === 'object' && !Array.isArray(patterns) && patterns.hasOwnProperty('path')) {
    return this.loadOne(patterns);
  }
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }
  if (Array.isArray(patterns)) {
    _.reduce(patterns, load.reduceArray(locals, options), o);
  } else {
    _.reduce(patterns, load.reduceObject(locals, options), o);
  }
};

load.reduceObject = function (locals, options) {
  return function (acc, value, key) {
    this.loadOne(key, value, locals, options);
    return acc;
  }.bind(this);
};

load.reduceArray = function (locals, options) {
  return function (acc, value, key) {
    if (typeof value === 'string') {
      glob.sync(value).forEach(function(fp) {
        this.loadOne(fp, this.read(fp), locals, options);
      }.bind(this));
    } else {
      this.loadOne(value, locals, options);
    }
    return acc;
  }.bind(this);
};

load.get = function (key) {
  return o[key];
};

load.load = function () {
  var args = [].slice.call(arguments);
  var last = args[args.length - 1];
  var multiple = false;

  if (typeof last === 'boolean') {
    multiple = last;
  }

  if (multiple) {
    return this.loadMany.apply(this, args);
  } else {
    return this.loadOne.apply(this, args);
  }
};

load.read = function (filepath) {
  return fs.readFileSync(filepath, 'utf8');
};

load.parse = function (str, options) {
  if (options && options.parse) {
    return options.parse(str, options);
  }
  return matter(str, options);
};

load.normalize = function (key, value, locals, options) {
  locals = locals || {};
  var opts = _.extend({}, options, locals.options);
  if (opts.normalize) {
    return opts.normalize.apply(null, arguments);
  }
  return value;
};

var options = {
  normalize: function (key, value, locals, options) {
    locals = locals || {};
    options = options || locals.options || {};
    var obj = {};
    if (typeof value === 'string') {
      obj = load.parse(value, options);
    } else {
      obj = value;
    }
    obj.path = obj.path || key;
    obj.locals = _.omit(locals, ['options']);
    obj.options = options;
    return obj;
  }
};

// var locals = {
//   options: options
// };

// var manyObj = {};
// glob.sync('fixtures/three/*.md').forEach(function(fp) {
//   // load.loadOne(fp, matter.read(fp), locals);
//   manyObj[fp] = {content: load.read(fp)};
// });

// glob.sync('fixtures/two/*.md').forEach(function(fp) {
//   load.loadOne(fp, fs.readFileSync(fp, 'utf8'), locals);
// });

// var many = glob.sync('fixtures/one/*.md');

// // load.set('home', '')

// // console.log(o)
// // console.log(load.loadMany(many));
// load.loadMany(many, locals);
// load.loadMany('fixtures/two/*.md', locals);
// load.loadMany(manyObj, locals);
// console.log(o);

module.exports = load;
