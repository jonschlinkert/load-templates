'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Lazily required module dependencies
 */

var lazy = require('lazy-cache')(require);
lazy('is-extendable', 'isObject');
lazy('defaults-deep', 'defaults');
lazy('extend-shallow', 'extend');
lazy('array-union', 'union');
lazy('object.pick', 'pick');
lazy('object.omit', 'omit');
lazy('kind-of', 'typeOf');
lazy('globby', 'glob');
lazy('relative');
lazy('is-glob');

var rootKeys = [
  'path',
  'content',
  'data',
  'locals',
  'orig',
  'options'
];

function Loader(opts) {
  opts = opts || {};
  opts.rootKeys = lazy.union(opts.rootKeys || [], rootKeys);
  this.options = opts;
  this.cache = {};
}

/**
 * Load templates.
 */

Loader.prototype.load = function(key/*, value, locals, options*/) {
  switch(lazy.typeOf(key)) {
    case 'string':
      return this.loadString.apply(this, arguments);
    case 'object':
      return this.loadObject.apply(this, arguments);
    case 'array':
      return this.loadArray.apply(this, arguments);
  }
};

Loader.prototype.loadString = function(key, value/*, locals, options*/) {
  var args = [].slice.call(arguments);
  var len = args.length;
  var last = args[len - 1];
  var opts = this.options;

  if (lazy.isObject(last)) {
    opts = lazy.extend({}, this.options, last);
  }

  if (lazy.isGlob(key) && typeof value === 'string') {
    throw new Error('load-templates#loadString: invalid second argument: ' + value);
  }

  var files = lazy.glob.sync(key, opts);

  if (files.length) {
    args.shift();
    files.forEach(function (fp) {
      if (typeof opts.cwd === 'string') {
        fp = path.join(opts.cwd, fp);
      }
      var file = this.normalize.apply(this, args);
      file.content = this.readFn(fp, opts);
      file.path = this.resolve((file.path || fp), opts);
      this.cache[this.renameKey(fp, opts)] = file;
    }.bind(this));

  } else {
    var fp = args.shift();
    if (typeof opts.cwd === 'string') {
      fp = path.join(opts.cwd, fp);
    }
    var file = this.normalize.apply(this, args);
    file.path = this.resolve((file.path || fp), opts);
    this.cache[this.renameKey(fp, opts)] = file;
  }
  return this.cache;
};

Loader.prototype.loadArray = function(key/*, value, locals, options*/) {
  var opts = lazy.extend({nonull: true}, this.options);
  var files = lazy.glob.sync(key, opts);
  if (!files.length && opts.strict) {
    throw new Error('Loader#loadArray cannot find glob pattern: ' + key);
  }


  var args = [].slice.call(arguments, 1);
  var rest = this.normalize.apply(this, args);
  files.forEach(function (fp) {
    if (typeof opts.cwd === 'string') {
      fp = path.join(opts.cwd, fp);
    }
    var content = this.readFn(fp, opts);
    var file = {};
    if (fp.slice(-5) === '.json') {
      file = content;
    } else {
      file.content = content;
    }
    file = lazy.defaults({}, file, rest);
    opts = lazy.extend({}, this.options, file.options);
    file.path = this.resolve((file.path || fp), opts);
    this.cache[this.renameKey(fp, opts)] = this.sift(file, 'locals');
  }.bind(this));
  return this.cache;
};

Loader.prototype.loadObject = function(template/*, value, locals, options*/) {
  var args = [].slice.call(arguments, 1);
  var rest = this.normalize.apply(this, args);

  // if it has a `path` property, then it doesn't have a key
  if (template.hasOwnProperty('path')) {
    this.cache[template.path] = this.normalize.apply(this, arguments);
  } else {

    for (var key in template) {
      if (template.hasOwnProperty(key)) {
        var file = lazy.defaults({}, template[key], rest);
        var opts = lazy.extend({}, this.options, file.options);

        // normalize file.path
        file.path = this.resolve((file.path || key), opts);
        if (typeof opts.cwd === 'string') {
          file.path = path.join(opts.cwd, file.path);
        }

        // cache the template and normalize the template key
        this.cache[this.renameKey(key, opts)] = this.sift(file, 'locals');
      }
    }
  }
  return this.cache;
};

Loader.prototype.normalize = function(value, locals, options) {
  var args = [].slice.call(arguments);
  if (args.length === 0) return {};
  var file = {};

  if (value && typeof value === 'object' && value.content || value.path) {
    file = args.shift();
    file = lazy.extend({content: '', path: ''}, file);
  } else if (typeof value === 'string') {
    file.content = args.shift();
  }

  locals = args.shift() || {};
  options = args.shift() || {};

  extendOmit('locals', options, locals);
  extendOmit('options', locals, options);

  extendOmit('locals', locals, locals);
  extendOmit('options', options, options);

  if (Object.keys(options).length) {
    file.options = lazy.extend({}, file.options, options);
  }
  if (Object.keys(locals).length) {
    file.locals = lazy.extend({}, file.locals, locals);
  }

  file = this.sift(file, 'locals');
  return file;
};

Loader.prototype.sift = function(val, key) {
  var file = lazy.pick(val, this.options.rootKeys);
  var keys = Object.keys(file);
  if (keys.length) {
    file[key] = file[key] || {};
    var prop = lazy.omit(val, keys);
    file[key] = lazy.extend({}, file[key], prop);
    if (!Object.keys(file[key]).length) {
      delete file[key];
    }
  }
  return file;
};

Loader.prototype.readFn = function(fp, options) {
  var opts = lazy.extend({}, this.options, options);
  try {
    if (typeof opts.readFn === 'function') {
      return opts.readFn(fp);
    }
    var str = fs.readFileSync(fp, 'utf8');
    if (fp.slice(-5) === '.json') {
      var file = JSON.parse(str);
      file.orig = str;
      return file;
    }
    return str;
  } catch(err) {}
  return fp;
};

Loader.prototype.renameKey = function(fp, options) {
  var opts = lazy.extend({}, this.options, options);
  if (typeof opts.renameKey === 'function') {
    return opts.renameKey(fp);
  }
  if (opts.relative === false) return fp;
  return lazy.relative(fp);
};

Loader.prototype.resolve = function(fp, options) {
  var opts = lazy.extend({}, this.options, options);
  if (typeof opts.resolve === 'function') {
    return opts.resolve(fp);
  }
  if (opts.relative === false) return fp;
  return lazy.relative(fp);
};

function extendOmit(prop, o, target) {
  if (typeof target !== 'object') target = o;
  if (o.hasOwnProperty(prop)) {
    lazy.extend(target, o[prop]);
    delete o[prop];
  }
}

module.exports = Loader;
