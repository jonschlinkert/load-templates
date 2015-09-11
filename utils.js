'use strict';

var fs = require('fs');
var path = require('path');
var keys = ['contents', 'content', 'base', 'cwd', 'path', 'stat', 'history'];

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
utils('globby', 'glob');
utils('is-valid-glob', 'isGlob');

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
      return fs.statSync(fp);
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

utils.isOptions = function isOptions(val) {
  if (!val || typeof val !== 'object') return null;
  return has(val, 'cwd')
    || has(val, 'ignore')
    || has(val, 'renameKey')
    || has(val, 'nonull')
    || has(val, 'nobrace')
    || has(val, 'nocase')
    || has(val, 'dot')
};

utils.getProps = function getProps(file) {
  var view = {};
  for (var key in file) {
    if (file.hasOwnProperty(key) && keys.indexOf(key) > -1) {
      view[key] = file[key];
    }
  }
  return view;
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

/**
 * Expose `utils`
 */

module.exports = utils;
