/*!
 * loader <https://github.com/jonschlinkert/loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var assert = require('assert');
var loader = require('./');
var _ = require('lodash');


describe('load single templates', function () {
  describe('.load() strings', function () {
    it('should load a template string.', function () {
      var files = loader.load('a.md', 'b');
      files.get('a.md').should.have.property('content', 'b');
    });

    it('should load a template string.', function () {
      var files = loader.load('a.md', {content: 'c'});
      files.get('a.md').should.have.property('content', 'c');
    });

    it('should load a template string.', function () {
      var files = loader.load('a.md', {content: 'c'});
      files.get('a.md').should.have.property('content', 'c');
    });
  });
});


var options = {
  normalize: function (key, value, locals, options) {
    locals = locals || {};
    options = options || locals.options || {};
    var obj = {};
    if (typeof value === 'string') {
      obj = loader.parse(value, options);
    } else {
      obj = value;
    }
    obj.path = obj.path || key;
    obj.locals = _.omit(locals, ['options']);
    obj.options = options;
    return obj;
  }
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

// // load.set('home', '')

// // console.log(o)
// // console.log(load.loadMany(many));
// load.loadMany(many, locals);
// load.loadMany('fixtures/two/*.md', locals);
// load.loadMany(manyObj, locals);
// console.log(o);
