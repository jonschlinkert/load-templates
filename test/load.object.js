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

  it('should load loader from an object', function () {
    loader.load({'foo/bar.md': {content: 'this is content.'}});
    loader.cache.should.be.an.object;
    loader.get('bar.md').should.have.property('path');
    loader.get('bar.md').should.have.property('locals');
    loader.get('bar.md').should.have.property('content');
  });

  it('should normalize locals passed as a second param', function () {
    loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});
    loader.cache.should.be.an.object;
    loader.get('bar.md').should.have.property('path');
    loader.get('bar.md').should.have.property('locals');
    loader.get('bar.md').locals.should.eql({foo: 'bar'});
  });

  it('should use the key as the `path`:', function () {
    loader.load({a: {content: 'A above\n{{body}}\nA below' , layout: 'b'}});

    loader.get('a').should.have.property('path', 'a');
    loader.get('a').should.have.property('locals');
    loader.get('a').locals.should.have.property('layout', 'b');
  });
});
