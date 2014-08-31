/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var resolve = require('resolve-dep');
var glob = require('globby');
var utils = require('./utils');
var _ = require('lodash');
var extend = _.extend;


/**
 * Create a new instance of `Loader`, optionally
 * passing default `options`.
 *
 * **Example:**
 *
 * ```js
 * var Loader = require('template-loader');
 * var templates = new Loader();
 * ```
 *
 * @param {Object} `options` Default options for front-matter and template naming.
 * @api public
 */

function loader(pattern, options) {
  return loader.load(pattern, options);
}


loader.load = function() {};
loader.resolve = function() {};
loader.normalize = function() {};

loader.file = function() {};
loader.files = function() {};

loader.string = function() {};
loader.object = function() {};
loader.function = function() {};
loader.array = function() {};


/**
 * Expose `Loader`
 */

module.exports = loader;
