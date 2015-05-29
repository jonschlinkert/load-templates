
var fs = require('fs');
var union = require('array-union');
var extend = require('extend-shallow');
var typeOf = require('kind-of');
var isGlob = require('is-glob');
var relative = require('relative');
var defaults = require('defaults-deep');
var glob = require('globby');
var pick = require('object.pick');
var omit = require('object.omit');

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
  opts.rootKeys = union(opts.rootKeys || [], rootKeys);
  this.options = opts;
  this.cache = {};
}

Loader.prototype.load = function(key/*, value, locals, options*/) {
  switch(typeOf(key)) {
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
  var opts = this.options;

  if (isGlob(key) && typeof value === 'string') {
    throw new Error('load-templates#loadString: invalid second argument: ' + value);
  }

  var files = glob.sync(key, opts);
  if (files.length) {
    args.shift();
    files.forEach(function (fp) {
      var file = this.normalize.apply(this, args);
      file.content = this.readFn(fp, opts);
      file.path = this.resolve(fp, opts);
      this.cache[this.renameKey(fp, opts)] = file;
    }.bind(this));

  } else {
    var fp = args.shift();
    var file = this.normalize.apply(this, args);
    file.path = this.resolve(fp, opts);
    this.cache[this.renameKey(fp, opts)] = file;
  }
  return this.cache;
};

Loader.prototype.loadArray = function(key/*, value, locals, options*/) {
  var opts = extend({nonull: true}, this.options);
  var files = glob.sync(key, opts);
  if (!files.length && opts.strict) {
    throw new Error('Loader#loadArray cannot find glob pattern: ' + key);
  }
  var args = [].slice.call(arguments, 1);
  var rest = this.normalize.apply(this, args);
  files.forEach(function (fp) {
    var content = this.readFn(fp, opts);
    var file = {};
    if (fp.slice(-5) === '.json') {
      file = content;
    } else {
      file.content = content;
    }
    file = defaults({}, file, rest);
    opts = extend({}, this.options, file.options);
    file.path = this.resolve(fp, opts);
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
        var file = defaults({}, template[key], rest);
        var opts = extend({}, this.options, file.options);
        // normalize file.path
        file.path = this.resolve(key, opts);
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

  if (value && typeof value === 'object' && value.hasOwnProperty('content')) {
    file = args.shift();
  } else if (typeof value === 'string') {
    file.content = args.shift();
  }

  locals = args.shift() || {};
  options = args.shift() || {};

  if (options.hasOwnProperty('locals')) {
     extend(locals, options.locals);
     delete options.locals;
  }
  if (locals.hasOwnProperty('locals')) {
     extend(locals, locals.locals);
     delete locals.locals;
  }
  if (locals.hasOwnProperty('options')) {
     extend(options, locals.options);
     delete locals.options;
  }
  if (options.hasOwnProperty('options')) {
     extend(options, options.options);
     delete options.options;
  }

  if (Object.keys(options).length) {
    file.options = extend({}, file.options, options);
  }
  if (Object.keys(locals).length) {
    file.locals = extend({}, file.locals, locals);
  }

  file = this.sift(file, 'locals');
  return file;
};

Loader.prototype.sift = function(val, key) {
  var file = pick(val, this.options.rootKeys);
  var keys = Object.keys(file);
  if (keys.length) {
    file[key] = file[key] || {};
    var prop = omit(val, keys);
    file[key] = extend({}, file[key], prop);
    if (!Object.keys(file[key]).length) {
      delete file[key];
    }
  }
  return file;
};

Loader.prototype.readFn = function(fp, options) {
  var opts = extend({}, this.options, options);
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
  var opts = extend({}, this.options, options);
  if (typeof opts.renameKey === 'function') {
    return opts.renameKey(fp);
  }
  if (opts.relative === false) return fp;
  return relative(fp);
};

Loader.prototype.resolve = function(fp, options) {
  var opts = extend({}, this.options, options);
  if (typeof opts.resolve === 'function') {
    return opts.resolve(fp);
  }
  if (opts.relative === false) return fp;
  return relative(fp);
};

module.exports = Loader;
