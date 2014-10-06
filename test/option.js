/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
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
    it.skip('should use a custom `renameKey` function to rename template keys:', function () {
    });
    it.skip('should use a custom `readFn` function to read templates:', function () {
    });
    it.skip('should use a custom `parseFn` function to parse templates:', function () {
    });

    it('should use a custom normalization function to rename the key.', function () {
      loader.option('normalize', function (acc, value, key) {
        key = path.basename(key);
        acc[key] = value;
        return acc;
      });

      var actual = loader.load('test/fixtures/a.txt', {a: 'b'}, {foo: true});
      actual.should.have.property('a.txt');
      actual['a.txt'].should.have.property('data', { title: 'AAA' });
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
