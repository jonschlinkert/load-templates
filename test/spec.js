/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var Loader = require('..');
var loader = new Loader();

var f1 = require('./fixtures/templates');
var f2 = require('./fixtures/templates2');

// convert templates from f1 to format of f2
var o = {};
f1.forEach(function (fixture, i) {
  o[i] = fixture;
});

var res = {};
Object.keys(f2).forEach(function (key, i) {
  var fixture = f2[key];
  var normalized = loader.load.apply(loader, fixture);
  // console.log('template ' + key + ':', util.inspect(normalized, null, 10));
  // wrapp in array for easier diffs, e.g. the originals are wrapped in arrays.
  res[key] = normalized;
});

// var str = JSON.stringify(res, null, 2)
var str = util.inspect(res, null, 10)
  .replace(/\n/g, '')
  .replace(/( +)/g, ' ')
  .replace(/(['"]\d+['"]:)/g, '\n  $1')
  .replace(/\}$/, '\n}')

fs.writeFileSync('test/actual/templates2.js', str);