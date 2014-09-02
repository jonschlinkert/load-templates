/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

var assert = require('assert');
var should = require('should');
var loader = require('..');


describe('template load:', function () {
  loader({cwd: 'test/fixtures'});

  describe('.load():', function () {
    describe('when template are defined as objects:', function () {

      it('should load loader from objects:', function () {
        var actual = loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});

        actual.should.have.property('a');
        actual.a.data.should.have.property('layout');
      });

      it('should load multiple loader from objects:', function () {
        var a = loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
        var b = loader.load({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
        var c = loader.load({c: {layout: 'd', content: 'C above\n{{body}}\nC below' }});

        a.should.have.property('a');
        a.a.data.should.have.property('layout');
        b.should.have.property('b');
        b.b.data.should.have.property('layout');
        c.should.have.property('c');
        c.c.data.should.have.property('layout');
      });

      it('should load loader from strings', function () {
        var a = loader.load('a', 'A above\n{{body}}\nA below', {layout: 'b'});
        var b = loader.load('b', 'B above\n{{body}}\nB below', {layout: 'c'});
        var c = loader.load('c', 'C above\n{{body}}\nC below', {layout: 'd'});

        a.should.have.property('a');
        a.a.data.should.have.property('layout');
        b.should.have.property('b');
        b.b.data.should.have.property('layout');
        c.should.have.property('c');
        c.c.data.should.have.property('layout');
      });
    });
  });
});
