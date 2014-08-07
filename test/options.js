/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var loader = require('..');
var _ = require('lodash');

describe('template options:', function () {
  describe('withExt', function () {
    describe('.set()', function () {
      it('should leave the extension on template names.', function () {
        var templates = loader({withExt: true});


        templates.load('test/fixtures/*.{md,tmpl}');
        templates.cache.should.have.property('a.md');
        templates.cache.should.have.property('a.tmpl');
        templates.cache.should.have.property('b.md');
        templates.cache.should.have.property('b.tmpl');
      });
    });

    describe('when .get() is used', function () {
      it('should leave the extension on template names.', function () {
        var templates = loader({withExt: true});
        templates.load('test/fixtures/*.{md,tmpl}');
        templates.cache.should.have.property('a.md');
        templates.cache.should.have.property('a.tmpl');
        templates.cache.should.have.property('b.md');
        templates.cache.should.have.property('b.tmpl');
      });
    });

  });

});