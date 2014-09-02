/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var assert = require('assert');
var should = require('should');
var templates = require('..');


describe('.string()', function() {
  it('should load a template from a string.', function () {

    templates.set('a', 'This is template <%= a %>');
    templates.set('b', 'This is template <%= b %>');

    console.log(templates)
    // var cache = Object.keys(templates.cache);
    // cache.should.have.length(2);
  });
});
