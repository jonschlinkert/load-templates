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
var Loader = require('..');
var loader;

describe('.glob()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('.read():', function () {
    it('should use the default read method.', function () {
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('content', 'This is fixture a.txt');
    });

    it('should use a user-defined read method defined on the constructor.', function () {
      loader = new Loader({
        read: function(filepath) {
          return fs.readFileSync(filepath, 'utf8') + ':foo';
        }
      });

      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('content', 'This is fixture a.txt:foo');
    });
  });
});
