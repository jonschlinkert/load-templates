'use strict';


var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var glob = require('globby');
var arrayify = require('arrayify-compact');
var extend = _.extend;


function loader(options) {
  loader.options = extend({
    cwd: process.cwd()
  }, options);
  return loader;
}

loader.options = {};
loader.rootProps = ['data', 'content', 'path', 'orig'];


loader.load = function (key, value, options) {
  var method = loader[typeOf(key)];
  if (method) {
    return method.call(this, key, value, options);
  }
};


loader.string = function (key, value, options) {
  var args = [].slice.call(arguments).filter(Boolean);
  var file = {}, files = [];

  if (typeof args[1] === 'string') {
    file[key] = {};
    file[key].content = value;
  } else {
    var patterns = arrayify(key).map(function(pattern) {
      return loader._cwd(pattern);
    });

    files = glob.sync(patterns, {nonull: false});

    if (files.length) {
      files.forEach(function (filepath) {
        var key = loader.rename(filepath);
        file[key] = loader.parse(filepath);
        file[key].path = filepath;
        file[key].data = extend({}, file[key].data, value);
      });
    } else {
      file[key] = value;
    }
  }

  // The object should be parsed and key renamed.
  return loader.object(file, options);
};

loader.array = function (patterns, options) {
  var o = {};
  arrayify(patterns).forEach(function (pattern) {
    extend(o, loader.load(pattern, options));
  });
  return o;
};

loader.object = function (file, options) {
  if (file.hasOwnProperty('path')) {
    file[file.path] = file;
  }
  return this.normalize(file, options);
};

loader._cwd = function (filepath) {
  var cwd = path.resolve(this.options.cwd);
  return path.join(cwd, filepath);
};

loader.rename = function (filepath) {
  if (this.options.rename) {
    return this.options.rename(filepath);
  }
  return filepath;
};

loader.parse = function (filepath, options) {
  var remove = _.keys(this.options).concat('normalized');
  var opts = extend({}, this.options, options);
  var o = {};

  if (opts.noparse) {
    return filepath;
  }

  if (opts.parse) {
    return opts.parse(filepath, _.omit(opts, remove));
  }

  o.path = filepath;
  o.content = fs.readFileSync(filepath, 'utf8');
  o.data = _.omit(opts, remove);
  return o;
};

loader.normalize = function (file, options) {
  var remove = _.keys(this.options).concat('normalized');
  var opts = _.extend({}, this.options, options);

  if (opts.nonormalize) {
    return file;
  }

  if (opts.normalize) {
    return opts.normalize(file);
  }
  var o = {}, data = _.omit(opts, remove);

  _.forIn(file, function (value, key) {
    value.path = value.path || key;
    if (!value.hasOwnProperty('normalized')) {
      key = loader.rename(key);
      delete value.normalized;
    }
    var root = _.pick(value, loader.rootProps);
    root.data = extend({}, data, value.data, _.omit(value, loader.rootProps));
    o[key] = root;
  });

  return o;
};



function typeOf(value) {
  return Object.prototype.toString.call(value).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
}

module.exports = loader;