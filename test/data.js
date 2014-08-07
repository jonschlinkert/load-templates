/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var loader = require('..');


describe('template data:', function () {
  describe('.load():', function () {
    it('should normalize `data` passed as a second arg:', function () {
      var templates = loader();
      templates.load({a: {content: 'A'}}, {data: {aaa: 'bbb'}});
      templates.get('a').should.have.property('content');
      templates.get('a').should.have.property('data');
    });

    it('should normalize `locals` passed as a second arg:', function () {
      var templates = loader();
      templates.load({b: {content: 'B'}}, {locals: {bbb: 'ccc'}});
      templates.get('b').should.have.property('content');
      templates.get('b').should.have.property('data');
    });

    it('should flatten `locals` and `data`:', function () {
      var templates = loader();
      templates.load({a: {content: 'A'}}, {
        data: {aaa: 'bbb'},
        locals: {bbb: 'ccc'}
      });
      templates.get('a').should.have.property('content');
      templates.get('a').should.have.property('data');
      templates.get('a').data.should.have.property('aaa');
      templates.get('a').data.should.have.property('bbb');
      templates.get('a').should.not.have.property('locals');
    });

    it('should move properties onto the `data` object:', function () {
      var templates = loader();
      templates.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});

      templates.get('a').data.should.have.property('layout');
      templates.get('a').data.should.not.have.property('locals');
      templates.get('a').data.should.not.have.property('original');
      templates.get('a').data.should.not.have.property('content');
      templates.get('a').data.should.not.have.property('data');
    });
  });
});