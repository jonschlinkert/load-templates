/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Loader = require('..');
var _ = require('lodash');

describe('template options:', function () {
  describe('option events', function () {
    it('should emit `option` when a value is set', function () {
      var called = false;
      var value = '';
      var templates = new Loader();

      templates.on('option', function (key, val) {
        called = key;
        value = val;
      });
      templates.option('foo', 'bar');
      called.should.equal('foo');
      value.should.equal('bar');
    });
  });

  describe('withExt', function () {
    describe('.set()', function () {
      it('should leave the extension on template names.', function () {
        var templates = new Loader({
          options: {withExt: true}
        });

        templates.load('test/fixtures/*.{md,tmpl}');
        templates.cache.should.have.property('a.md');
        templates.cache.should.have.property('a.tmpl');
        templates.cache.should.have.property('b.md');
        templates.cache.should.have.property('b.tmpl');
      });
    });

    describe('when .get() is used', function () {
      it('should leave the extension on template names.', function () {
        var templates = new Loader({
          options: {withExt: true}
        });
        templates.load('test/fixtures/*.{md,tmpl}');
        templates.get().should.have.property('a.md');
        templates.get().should.have.property('a.tmpl');
        templates.get().should.have.property('b.md');
        templates.get().should.have.property('b.tmpl');
      });
    });
    describe('when extensions are escaped with `.get()`', function () {
      it('should leave the extension on template names.', function () {
        var templates = new Loader({
          options: {withExt: true}
        });

        templates.load('test/fixtures/*.{md,tmpl}');
        templates.get('a\\.md').should.have.property('data');
        templates.get('a\\.tmpl').should.have.property('data');
        templates.get('b\\.md').should.have.property('data');
        templates.get('b\\.tmpl').should.have.property('data');
      });
    });
    describe('when extensions are escaped using array syntax', function () {
      it('should leave the extension on template names.', function () {
        var templates = new Loader({
          options: {withExt: true}
        });

        templates.load('test/fixtures/*.{md,tmpl}');
        templates.get(['a.md']).should.have.property('data');
        templates.get(['a.md']).should.have.property('data');
        templates.get(['a.tmpl']).should.have.property('data');
        templates.get(['b.md']).should.have.property('data');
        templates.get(['b.tmpl']).should.have.property('data');
      });
    });
  });

});