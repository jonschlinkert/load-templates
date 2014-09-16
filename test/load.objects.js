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


describe('when templates are formatted as objects', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  it('should load multiple templates from objects:', function () {
    loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
    loader.load({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
    loader.load({c: {layout: 'd', content: 'C above\n{{body}}\nC below' }});

    loader.cache.should.have.property('a');
    loader.cache.a.locals.should.have.property('layout');
    loader.cache.should.have.property('b');
    loader.cache.b.locals.should.have.property('layout');
    loader.cache.should.have.property('c');
    loader.cache.c.locals.should.have.property('layout');
  });
});
