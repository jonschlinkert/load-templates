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
  describe('withExt', function () {
   xit('should leave the extension on template names.', function () {
      var templates = new Loader({
        options: {
          withExt: true
        }
      });
      templates.load('test/fixtures/*.{md,tmpl}');

      var cache = templates.get();

      // These are failing, but I think we should un-escape names
      // when the `.get()` method is used.
      cache.should.have.property('a.md');
      cache.should.have.property('a.tmpl');
      cache.should.have.property('b.md');
      cache.should.have.property('b.tmpl');

      // These are passing
      templates.cache.should.have.property('a\\.md');
      templates.cache.should.have.property('a\\.tmpl');
      templates.cache.should.have.property('b\\.md');
      templates.cache.should.have.property('b\\.tmpl');
    });
  });

});
