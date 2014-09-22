'use strict';

var hasAny = require('has-any');
var mapFiles = require('map-files');
var reduce = require('reduce-object');
var matter = require('gray-matter');
var hasAnyDeep = require('has-any-deep');
var uniqueId = require('uniqueid');
var isEmpty = require('is-empty');
var isObject = require('is-plain-object');
var omitEmpty = require('omit-empty');
var reduce = require('reduce-object');
var deepPick = require('deep-pick');
var deepMixin = require('mixin-deep');
var _ = require('lodash');


var rootKeys = exports.rootKeys = ['path', 'content', 'locals', 'data', 'orig', 'options'];


var typeOf = function typeOf(val) {
  return {}.toString.call(val).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};


/**
 * If we detected a `path` property directly on the object
 * that was passed, this means that the object is not
 * formatted with a key (as expected).
 *
 * ```js
 * // before
 * normalize({path: 'a/b/c.md', content: 'this is foo'});
 *
 * // after
 * normalize('a/b/c.md': {path: 'a/b/c.md', content: 'this is foo'});
 * ```
 *
 * @param  {String} `path`
 * @param  {Object} `value`
 * @return {Object}
 */

var createKeyFromPath = function(filepath, value) {
  var o = {};
  o[filepath] = value;
  return o;
};

// normalize({'a/b/d.md': {content: 'this is content'}})
var createPathFromStringKey = function(a) {
  for (var key in a) {
    if (a.hasOwnProperty(key)) {
      a[key].path = a[key].path || key;
    }
  }
  return a;
};

// normalize('a/b/c.md', {content: 'this is content'});
var createPathFromObjectKey = function(key, value) {
  var o = {};
  value.path = value.path || key;
  o[key] = value;
  return o;
};

var generateId = function (options) {
  var opts = _.extend({}, options);

  return opts.id ? opts.id : uniqueId({
    prefix: opts.prefix || '__id__',
    append: opts.append || ''
  });
};

var generateKey = function(patterns, locals, options) {
  var key = generateId(options);

  if (options && options.uniqueid && typeof options.uniqueid === 'function') {
    key = options.uniqueid(patterns, options);
  }

  var o = {};
  var value = {value: patterns, locals: locals, options: options};
  o[key] = omitEmpty(value);

  return o;
};


var parseFn = function(filepath, options) {
  var opts = _.extend({autodetect: true}, options);
  if (opts.parseFn) {
    return opts.parseFn(filepath, options);
  }
  return matter.read(filepath, opts);
};

var readFn = function(filepath, options) {
  var opts = _.extend({}, options);
  if (opts.readFn) {
    return opts.readFn(filepath, options);
  }
  return readFn(filepath, opts);
};

var renameKey = function(filepath, options) {
  var opts = _.extend({}, options);
  if (opts.renameKey) {
    return opts.renameKey(filepath, options);
  }
  return filepath;
};


var mapFilesFn = function(patterns, options) {
  return mapFiles(patterns, _.extend({
    rename: renameKey,
    parse: parseFn
  }, options));
};


var _omit = function (o, keys) {
  return (o == null) ? {} : _.omit(o, keys);
};

var _pick = function (o, keys) {
  return (o == null) ? {} : _.pick(o, keys);
};

var pickRoot = function(o) {
  return _pick(o, rootKeys);
};

var pickLocals = function(o) {
  return _omit(o, rootKeys);
};


var extendLocals = function(value) {
  if (value == null) {
    return {};
  }

  if (Object.keys(value).length === 0) {
    return value;
  }

  var o = pickRoot(value);
  var loc = pickLocals(value);

  _.merge(loc, o.locals);
  o.locals = loc;
  return o;
};

var omitOptions = function(o) {
  return _omit(o, ['options']);
};

var flattenProp = function(o, prop) {
  function flat(obj, key) {
    var opts = deepPick(obj, key)[key];
    deepMixin(obj, opts);
    return _omit(obj, key);
  }

  if (isObject(o)) {
    if (o.hasOwnProperty(prop)) {
      return flat(o, prop);
    } else {
      return reduce(o, function (acc, value, key) {
        if (isObject(value)) {
          acc[key] = flat(value, prop);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
    }
  }
};


var mergeEach = function (o, arr) {
  if (!arr) {
    return o;
  }

  arr = Array.isArray(arr) ? arr : [arr];

  return arr.reduce(function (acc, obj) {
    if (obj && typeOf(obj) === 'object') {
      return _.merge(acc, obj);
    } else {
      return acc;
    }
  }, o);
};


/**
 * When the first arg is a string:
 *
 * ```js
 * normalize('a/b/c.md', ...);
 * ```
 *
 * @param  {[type]} key
 * @param  {[type]} value
 * @return {[type]}
 */

var normalizeFiles = function (patterns, locals, options) {
  var files = mapFilesFn(patterns, options);
  options = _.merge({}, options);
  locals = _.merge({}, locals);

  if (Object.keys(files).length === 0) {
    return generateKey(patterns, locals, options);
  }

  return reduce(files, function (acc, value, key) {
    value.options = _.merge({}, value.options, locals.options, options);
    value.locals = _.merge({}, value.locals, omitOptions(locals));

    acc[key] = value;
    return acc;
  }, {});
};

var firstTypeOf = function(type, args) {
  var len = args.length;
  var val = null;

  for (var i = 0; i < len; i++) {
    if (typeOf(args[i]) === type) {
      return i;
    }
  };
  return val;
};

var siftProps = function siftProps(value, locals, options) {
  var args = [].slice.call(arguments);
  var first = firstTypeOf('object', args);
  var diff = args.length - first;

  var locs = {};
  var opts = {};
  var o = {};

  locs = args[first] || {};
  opts = args[first + 1] || {};

  if (diff <= 1 && !!args[first]) {
    opts = args[first].options;
  }

  var val;
  if (hasAny(locs, ['path', 'content'])) {
    val = deepPick(locs, 'locals')['locals'];
    if (!isEmpty(val)) {
      locs = val;
    }
  }

  if (hasAny(opts, ['path', 'content'])) {
    opts = deepPick(opts, 'options')['options'];
  }

  if (locs != null) {
    deepMixin(opts, locs.options);
    o.locals = _.omit(locs.locals || locs, ['options']);
  }

  if (opts != null) {
    o.options = opts.options || opts;
  }
  return o;
};


var normalizeString = function (key, value, locals, options) {
  var args = [].slice.call(arguments, 1);
  var props = siftProps.apply(siftProps, args);
  var opts = options || props.options;
  var locs = props.locals;
  var o = {};

  // Second value === 'string'
  if (typeof value === 'string') {
    opts = flattenProp(opts, 'options');
    o[key] = {path: key, content: value, locals: locs, options: opts};
    return o;

  // Second value === 'object'
  } else if (isObject(value)
      && !Array.isArray(value)
      && hasAny(value, ['path', 'content'])) {

    value = extendLocals(value);
    value.options = opts;

    return createPathFromObjectKey(key, value);
  } else {
    return normalizeFiles(key, value, locals, options);
  }
};


var normalizeShallowObject = function (value, locals, options) {
  value = extendLocals(value);
  value.locals = _.defaults({}, value.locals, locals);
  value.options = _.defaults({}, value.options, options);
  return value;
};


/**
 * This pattern indicates that either the following
 *
 * ```js
 * => {'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'}}
 * ```
 * or multiple templates
 *
 * ```js
 * { 'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.'},
 *   'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.'},
 *   'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'} }
 *```
 */

var normalizeDeepObject = function (obj, locals, options) {
  return _.transform(obj, function (acc, value, key) {
    acc[key] = normalizeShallowObject(value, locals, options);
  });
};


/**
 * The first arg is an object:
 *
 * ```js
 * normalize({'a/b/c.md', ...});
 *
 * // or
 * normalize({path: 'a/b/c.md', ...});
 * ```
 *
 * @param  {[type]} a
 * @param  {[type]} b
 * @return {[type]}
 */

var normalizeObject = function (obj) {
  var args = [].slice.call(arguments, 1);
  var keys = Object.keys(obj);

  var locals1 = pickLocals(args[0]);
  var locals2 = pickLocals(args[1]);
  var val;

  var opts = args.length === 2 ? locals2 : null;

  //=> {path: 'a/b/c.md', content: 'this is content.'}
  if (hasAny(obj, ['path', 'content'])) {
    val = normalizeShallowObject(obj, locals1, opts);
    return createKeyFromPath(val.path, val);

  } else if (hasAnyDeep(obj, ['path', 'content'])) {
    val = createPathFromStringKey(obj);
    return normalizeDeepObject(val, locals1, opts);

  } else {
    throw new Error('Invalid template object. Must have a `path` or `content` property.');
  }
};


var normalizeArray = function (patterns, locals, options) {
  var opts = _.merge({}, locals && locals.options, options);
  return normalizeFiles(patterns, locals, opts);
};


exports.normalizeFormat = function () {
  var args = [].slice.call(arguments);

  switch (typeOf(args[0])) {
  case 'string':
    return normalizeString.apply(this, args);
  case 'object':
    return normalizeObject.apply(this, args);
  case 'array':
    return normalizeArray.apply(this, args);
  default:
    return args;
  }
};


exports.normalize = function(o) {
  o = exports.normalizeFormat.apply(this, arguments);
  return _.transform(o, function (acc, value, key) {
    if (Object.keys(value).length === 0) {
      return acc;
    }

    value = omitEmpty(value);
    var opts = value.options || {};

    acc[renameKey(key, opts)] = value;
  }, {});
};

