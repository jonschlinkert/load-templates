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
var _ = require('lodash');

var Loader = require('..');
var loader;

describe('.parse()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should use the default `.parse()` method.', function () {
    loader.load('test/fixtures/*.txt', true);
    loader.get('a.txt').data.should.have.property('title', 'AAA');
  });

  it('should use a user-defined `.parse()` method defined on the constructor.', function () {
    loader = new Loader({
      parse: function(str) {
        return _.extend(matter(str), {foo: 'bar'});
      }
    });
    loader.load('test/fixtures/*.txt', true);
    loader.get('a.txt').should.have.property('foo', 'bar');
  });
});
