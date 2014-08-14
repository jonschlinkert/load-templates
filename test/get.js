/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var loader = require('..');


describe('template get:', function () {
  describe('.get():', function () {
    describe('when template are defined as objects:', function () {

      it('should get a `load()`ed template object by name:', function () {
        var templates = loader();
        templates.load({a: {content: 'A'}}, {data: {aaa: 'bbb'}});
        templates.get('a').should.have.property('content');
        templates.get('a').should.have.property('data');
      });

      it('should get a `.set()` template object by name:', function () {
        var templates = loader();
        templates.set('a', {content: 'A'}, {data: {aaa: 'bbb'}});
        templates.get('a').should.have.property('content');
        templates.get('a').should.have.property('data');
      });

      it('should get a nested property from a template object:', function () {
        var templates = loader();
        templates.load({b: {content: 'B'}}, {locals: {bbb: 'ccc', ddd: {eee: 'fff'}}});
        templates.get('b').data.should.have.property('bbb');
        templates.get('b').data.ddd.eee.should.equal('fff');
      });

      it('should get templates from objects:', function () {
        var templates = loader();

        templates.load({a: {content: 'A'}}, {data: {aaa: 'bbb'}});
        templates.load({b: {content: 'B'}}, {locals: {bbb: 'ccc'}});
        templates.load({c: {content: 'C'}}, {xxx: 'yyy'});

        templates.get('a').should.have.property('content');
        templates.get('a').should.have.property('data');
        templates.get('b').data.should.have.property('bbb');
        templates.get('c').data.should.not.have.property('xxx');
        templates.get('b').should.have.property('data');
        templates.get('b').should.not.have.property('locals');
        templates.get('b').should.not.have.property('locals');
      });
    });
  });
});