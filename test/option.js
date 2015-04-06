/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var Loader = require('..');
var loader = new Loader();

describe('.option()', function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe('when a key/value pair is passed to `.option()`', function () {
    it('should set the value to `key` on the options:', function () {
      loader.option('a', 'b');
      loader.options.should.have.property('a', 'b');
    });
  });

  describe('when only a key is passed', function () {
    it('should get the option:', function () {
      loader.option('a', 'c');
      loader.option('a').should.equal('c');
    });
  });

  describe('options:', function () {
    it('should use a custom `renameKey` function to rename template keys:', function () {
      loader.option('renameKey', function (key) {
        return path.basename(key);
      });

      var actual = loader.load('test/fixtures/a.txt');
      actual.should.have.property('a.txt');
    });

    it('should use a custom `readFn` function to read templates:', function () {
      loader.option('readFn', function (filepath) {
        return filepath;
      });

      var actual = loader.load('test/fixtures/a.txt');
      actual.should.have.property('test/fixtures/a.txt');
    });

    it('should use a custom normalization function to modify the template object.', function () {
      loader.option('normalize', function (acc, value, key) {
        key = path.basename(key);
        value.key = key;
        acc[key] = value;
        return acc;
      });

      var actual = loader.load('test/fixtures/a.txt', {a: 'b'}, {foo: true});
      actual.should.have.property('a.txt');
      actual['a.txt'].should.have.property('key', 'a.txt');
    });

    it('should use a custom normalization function to add a `name` property.', function () {
      loader.option('normalize', function (acc, value, key) {
        key = path.basename(key);
        value.name = key;
        acc[key] = value;
        return acc;
      });

      var actual = loader.load('test/fixtures/a.txt', {a: 'b'}, {foo: true});
      actual.should.have.property('a.txt');
      actual['a.txt'].should.have.property('name', 'a.txt');
    });
  });
});
