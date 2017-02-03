'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend');
require('file-contents', 'contents');
require('glob-parent', 'parent');
require('is-glob');
require('kind-of', 'typeOf');
require('matched', 'glob');
require('vinyl');
require = fn;

/**
 * Set the `file.key` used for caching views
 */

utils.renameKey = function(file, opts) {
  if (opts && typeof opts.renameKey === 'function') {
    return opts.renameKey(file);
  }
  return file.key || file.path;
};

/**
 * Cast val to an array
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Return true if `val` is a valid view
 */

utils.isView = function(val) {
  return utils.isObject(val) && (val.isView || val.isItem || val.path || val.contents);
};

/**
 * Return true if `val` is an object
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Expose `utils`
 */

module.exports = utils;
