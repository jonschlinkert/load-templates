/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var Loader = require('..');
var loader;
var utils = require('../lib/utils');


describe('.renameKey()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should rename the given path using `path.basename()`', function () {
    utils.glob('test/fixtures/*.md').forEach(function(file) {
      loader.renameKey(file).should.equal(path.basename(file));
    });
  });

  it('should rename the given path using a custom function on the `.renameKey()` options.', function () {
    utils.glob('test/fixtures/*.md').forEach(function(file) {
      var key = loader.renameKey(file, {
        renameKey: function(fp) {
          return path.basename(fp, path.extname(fp));
        }
      });
      key.should.equal(path.basename(file, path.extname(file)));
    });
  });

  it('should rename the given path using a custom function on the `.reduceFiles()` options.', function () {
    var files = loader.reduceFiles('test/fixtures/*.md', {
      options: {
        renameKey: function(fp) {
          return path.basename(fp, path.extname(fp));
        }
      }
    });

    var keys = Object.keys(files);
    var files = utils.glob('test/fixtures/*.md');

    keys.forEach(function(key, i) {
      var name = path.basename(files[i], path.extname(files[i]));
      key.should.equal(name);
    });
  });
});

