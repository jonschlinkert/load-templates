/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var Loader = require('..');


describe('template data:', function () {
  describe('.load():', function () {
    it('should normalize `data` passed as a second arg:', function () {
      var templates = new Loader();
      templates.load({a: {content: 'A'}}, {data: {aaa: 'bbb'}});

      templates.get('a').should.have.property('content');
      templates.get('a').should.have.property('data');
    });

    // it('should normalize `locals` passed as a second arg:', function () {
    //   var templates = new Loader();

    //   templates.load({a: {content: 'A'}}, {data: {aaa: 'bbb'}});
    //   templates.load({b: {content: 'B'}}, {locals: {bbb: 'ccc'}});
    //   templates.load({c: {content: 'C'}}, {xxx: 'yyy'});

    //   templates.getTemplate('a').should.have.property('content');
    //   templates.getTemplate('a').should.have.property('data');
    // });

    // it('should normalize `data` passed as a second arg:', function () {
    //   var templates = new Loader();

    //   templates.load({a: {content: 'A'}}, {data: {aaa: 'bbb'}});
    //   templates.load({b: {content: 'B'}}, {locals: {bbb: 'ccc'}});
    //   templates.load({c: {content: 'C'}}, {xxx: 'yyy'});

    //   templates.getTemplate('a').should.have.property('content');
    //   templates.getTemplate('a').should.have.property('data');
    //   templates.getTemplate('b').should.have.property('data');
    //   templates.getTemplate('b').should.not.have.property('locals');
    //   templates.getTemplate('b').should.not.have.property('locals');
    // });

  });
});