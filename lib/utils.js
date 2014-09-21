'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var matter = require('gray-matter');
var debug = require('debug')('load-templates:utils');
var glob = require('globby');
var _ = require('lodash');


/**
 * Get the type of an object.
 *
 * @param  {*} value
 * @return {*}
 * @api private
 */

var typeOf = exports.typeOf = function (value) {
  return Object.prototype.toString.call(value).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};

exports.isString = function (value) {
  return typeOf(value) === 'string';
};

exports.isArray = function (value) {
  return Array.isArray(value) &&
    typeOf(value) === 'array';
};

exports.isObject = function (value) {
  return !Array.isArray(value) &&
    typeOf(value) === 'object';
};


/**
 * Read the given file. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

exports.glob = function (patterns, options) {
  debug('exports.glob: %s', patterns);

  return glob.sync(patterns, _.extend({
    nonull: false
  }, options));
};


/**
 * Read the given file. `fs.readFileSync` is used by default.
 *
 * @param  {String} `filepath` The path of the file to read.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

exports.read = function (filepath, options) {
  var opts = _.extend({}, options);

  if (opts.read) {
    debug('opts.read: %s', filepath);
    return opts.read.call(this, filepath);
  }

  debug('exports.read: %s', filepath);
  return fs.readFileSync(filepath, 'utf8');
};


/**
 * Parse the content of each template loaded using whatever parsing function
 * is defined on the options.
 *
 * @param  {String} `str` The string to parse.
 * @param  {Object} `Options` Options or `locals`.
 * @api public
 */

exports.parse = function (str, options) {
  var opts = _.extend({}, options);

  if (opts.parse) {
    debug('opts.parse: %s', str);
    return opts.parse(str, opts);
  }

  debug('exports.parse: %s', str);

  return matter(str, _.extend({
    autodetect: true
  }, opts));
};
