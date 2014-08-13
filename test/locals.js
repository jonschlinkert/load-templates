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


describe('template locals:', function () {
  describe('when a `locals` object is passed on the constructor.', function () {
    it('should move the object to `options`:', function () {
      var templates = loader({locals: {SITE: 'TITLE', BLOG: 'TITLE'}});

      templates.option('locals').should.have.property('SITE');
      templates.option('locals').should.have.property('BLOG');
      templates.options.locals.should.have.property('SITE');
      templates.options.locals.should.have.property('BLOG');
    });
  });

  describe('when a `locals` object is passed on the `.set()` method for a template.', function () {
    it('should move the object to the `data` property for that template:', function () {
      var templates = loader();

      templates.set('a', 'this is content', {locals: {SITE: 'TITLE', BLOG: 'TITLE'}});
      templates.get('a').data.should.have.property('SITE');
      templates.get('a').data.should.have.property('BLOG');
    });

    it('should merge with locals defined in the constructor:', function () {
      var templates = loader({locals: {SITE: 'GLOBAL'}});

      templates.set('a', 'this is content', {locals: {}});
      templates.get('a').data.should.have.property('SITE');
      templates.get('a').data.SITE.should.equal('GLOBAL');
    });

    it('should have preference over locals defined in the constructor:', function () {
      var templates = loader({locals: {SITE: 'GLOBAL'}});

      templates.set('a', 'this is content', {locals: {SITE: 'TITLE'}});
      templates.get('a').data.should.have.property('SITE');
      templates.get('a').data.SITE.should.equal('TITLE');
    });
  });

  describe('when a `locals` object is passed on the `.load()` method.', function () {
    it('should move the object to the `data` property for the loaded templates:', function () {
      var templates = loader();

      templates.load('a', 'this is content', {locals: { SITE: 'TITLE', BLOG: 'TITLE' }});
      templates.get('a').data.should.have.property('SITE');
      templates.get('a').data.should.have.property('BLOG');
    });

    it('should move the object to the `data` property for the loaded templates:', function () {
      var templates = loader();

      templates.load(['test/**/*.md', 'test/**/*.tmpl'], {data: {fff: 'ggg'}, baz: 'quux', locals: {a: 'b'}});
      templates.load('a', 'this is content', {locals: {SITE: 'TITLE', BLOG: 'TITLE'}});
      templates.get('a').data.should.have.property('SITE');
      templates.get('a').data.should.have.property('BLOG');
    });
  });
});
