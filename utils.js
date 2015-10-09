'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

var fn = require;
require = utils;
require('matched', 'glob');
require('extend-shallow', 'extend');
require('is-valid-glob', 'isValidGlob');
require('glob-parent', 'parent');
require('vinyl', 'File');
require = fn;

/**
 * utils
 */

utils.isObject = function isObject(val) {
  return val && typeof val === 'object'
    && !Array.isArray(val);
};

utils.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

utils.tryStat = function tryStat(fp, opts) {
  try {
    return fs.statSync(fp);
  } catch(err) {
    try {
      fp = path.resolve(opts.cwd, fp);
      return fs.lstatSync(fp);
    } catch(err) {}
  }
  // only reached when `nonull` is passed to glob
  return null;
};

utils.isView = function isView(val) {
  if (!val || typeof val !== 'object') return null;
  return has(val, 'contents')
    || has(val, 'content')
    || has(val, 'path');
};

utils.renameKey = function renameKey(name, opts) {
  if (opts && typeof opts.renameKey === 'function') {
    return opts.renameKey(name);
  }
  return name;
};

function has(val, key) {
  return val.hasOwnProperty(key);
}

utils.toFile = function(fp, pattern, options) {
  options = options || {};

  var file = { contents: null };
  file.cwd = options.cwd || process.cwd();
  file.path = path.resolve(file.cwd, fp);
  file.base = options.base;

  if (!file.base) {
    if (Array.isArray(pattern)) {
      pattern = pattern[0];
    }

    if (typeof pattern !== 'string') {
      throw new TypeError('expected pattern to be a string or array');
    }

    var base = utils.parent(pattern);
    if (base !== '.') {
      file.base = base;
    }
  }

  file = new utils.File(file);
  file.options = options;
  file.options.orig = fp;
  return file;
};

/**
 * Expose `utils`
 */

module.exports = utils;
