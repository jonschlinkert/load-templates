/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var matter = require('gray-matter');
var Loader = require('..');
var loader;
var _ = require('lodash');


var fixture = function(filepath) {
  return path.join(__dirname, 'fixtures/' + filepath)
    .replace(/[\\\/]/g, '/');
};


// var locals = {
//   options: options
// };

// var manyObj = {};

// glob.sync('fixtures/three/*.md').forEach(function(fp) {
//   // load.loadOne(fp, matter.read(fp), locals);
//   manyObj[fp] = {content: load.read(fp)};
// });

// glob.sync('fixtures/two/*.md').forEach(function(fp) {
//   load.loadOne(fp, fs.readFileSync(fp, 'utf8'), locals);
// });

// var many = glob.sync('fixtures/one/*.md');

// load.set('home', '');
// console.log(o)
// console.log(load.loadMany(many));
// load.loadMany(many, locals);
// load.loadMany('fixtures/two/*.md', locals);
// load.loadMany(manyObj, locals);
// console.log(o);



// describe('loader', function () {

// });