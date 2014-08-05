/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template partials', function () {

  describe('.partial():', function () {
    var template = new Template();
    it('should add a partial to `cache.partials`.', function () {
      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      var cache = Object.keys(template.cache.partials);
      cache.should.have.length(2);
    });

    it('should get partials from the cache', function () {
      var a = template.partial('a');
      var b = template.partial('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });

    it('should extend locals onto the cache.', function () {
      var template = new Template();
      template.partial('a', 'This is partial <%= a %>', {a: 'AAA'});
      template.partial('b', 'This is partial <%= b %>', {b: 'BBB'});

      var a = template.partial('a');
      var b = template.partial('b');

      a.locals.should.eql({a: 'AAA'});
      b.locals.should.eql({b: 'BBB'});
    });
  });

  describe('.partials():', function () {
    var template = new Template();

    template.partials({
      a: 'This is partial <%= a %>',
      b: 'This is partial <%= b %>',
      c: 'This is partial <%= c %>',
      d: 'This is partial <%= d %>'
    });

    it('should add multiple partials to `cache.partials`.', function () {
      var cache = Object.keys(template.cache.partials);
      cache.should.have.length(4);
    });

    it('should get partials from the cache', function () {
      var a = template.partial('a');
      var b = template.partial('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });
  });

  describe('when partials are defined using a `<%= partial() %>` tag:', function () {
    it('should process them with the given context.', function () {
      var template = new Template();

      template.partials({
        a: 'This is partial <%= a %>',
        b: 'This is partial <%= b %>'
      });

      var ctx = {a: 'A', b: 'B'};
      var a = template.process('<%= partial("a") %>', ctx);
      var b = template.process('<%= partial("b") %>', ctx);

      assert.equal(typeof a, 'string');
      assert.equal(typeof b, 'string');
      assert.equal(typeof template.partial('a'), 'object');
      assert.equal(typeof template.partial('b'), 'object');

      a.should.equal('This is partial A');
      b.should.equal('This is partial B');
    });
  });
});