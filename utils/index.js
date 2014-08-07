'use strict';

var path = require('path');
var segments = require('path-segments');
var _ = require('lodash');

/**
 * ## .typeOf
 *
 * Return a string indicating the type of the given value.
 *
 * @method `typeOf`
 * @param {*} `value` The value to check.
 * @return {*} The "type" of value.
 * @api private
 */

exports.typeOf = function(value) {
  return Object.prototype.toString.call(value)
    .toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};


/**
 * Flatten the `name` property on the given `data` object
 * (e.g. `data.data`, like when files named `data.json`
 * or `data.yml` are used), the value of `data.data`'s
 * is flattened to the root `data` object.
 *
 * @method flattenData
 * @param {Object} `data`
 * @return {Object} Returns the flattened object.
 * @api private
 */

exports.flattenData = function(data, name) {
  name = name || 'data';

  name = !Array.isArray(name) ? [name] : name;
  name.forEach(function (prop) {
    if (data && data.hasOwnProperty(prop)) {
      data = _.extend({}, data, data[prop]);
      delete data[prop];
    }
  });

  return data;
};


/**
 * Naming function, to enable customizing how
 * template names are derived from file paths.
 *
 * See the [segments] library for more detail.
 *
 * [segments]: https://github.com/jonschlinkert/path-segments
 *
 * @param  {String} `filepath`
 * @param  {Object} `options` Options to pass to [segments]
 * @return {Object}
 */

exports.rename = function(filepath, options) {
  var opts = _.extend({last: 1, withExt: false}, options);
  var res = segments(filepath, opts);
  if (opts.withExt) {
    return res.replace(/(\.)/g, '\.');
  }
  return res.replace(/\.[\S]+$/, '');
};


/**
 * Resolve a filepath.
 *
 * @param  {String} `filepath`
 * @return {String} Absolute filepath.
 */

exports.absolute = function(filepath) {
  return path.resolve(filepath);
};
