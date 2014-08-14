/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var loader = require('..');
var _ = require('lodash');


describe('template templates', function () {

  describe('.template():', function () {
    it('should add a template to `cache`.', function () {
      var template = loader();

      template.set('a', 'This is template <%= a %>');
      template.set('b', 'This is template <%= b %>');

      var cache = Object.keys(template.cache);
      cache.should.have.length(2);
    });

    it('should get templates from the cache', function () {
      var template = loader();

      template.set('a', 'This is template <%= a %>');
      template.set('b', 'This is template <%= b %>');

      var a = template.get('a');
      var b = template.get('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });

    it('should extend locals onto the cache.', function () {
      var template = loader();
      template.set('a', 'This is template <%= a %>', {locals: {a: 'AAA'}});
      template.set('b', 'This is template <%= b %>', {locals: {b: 'BBB'}});

      var a = template.get('a');
      var b = template.get('b');

      a.data.should.eql({a: 'AAA'});
      b.data.should.eql({b: 'BBB'});
    });
  });

  describe('.templates():', function () {

    it('should add multiple templates to `cache`.', function () {
      var template = loader();
      template.objects({
        a: 'This is template <%= a %>',
        b: 'This is template <%= b %>',
        c: 'This is template <%= c %>',
        d: 'This is template <%= d %>'
      });

      var cache = Object.keys(template.cache);
      cache.should.have.length(4);
    });

    it('should get templates from the cache', function () {
      var template = loader();

      template.objects({
        a: 'This is template <%= a %>',
        b: 'This is template <%= b %>',
        c: 'This is template <%= c %>',
        d: 'This is template <%= d %>'
      });
      var a = template.get('a');
      var b = template.get('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });
  });

  describe('when templates are defined using a `<%= template() %>` tag:', function () {
    it('should process them with the given context.', function () {
      var template = loader();

      template.objects({
        a: 'This is template <%= a %>',
        b: 'This is template <%= b %>'
      });

      assert.equal(typeof template.get('a'), 'object');
      assert.equal(typeof template.get('b'), 'object');
    });
  });
});