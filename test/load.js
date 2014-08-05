/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var Loader = require('..');


describe('template load:', function () {
  describe('.load():', function () {
    describe('when template are defined as objects:', function () {

      it('should load templates from objects:', function () {
        var templates = new Loader();
        templates.load({base: {content: 'base!\n{{body}}\nbase!' }});
        templates.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
        templates.load({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
        var a = templates.load({c: {layout: 'base', content: 'C above\n{{body}}\nC below' }});
        var b = templates.load({main: {content: 'last!\n{{body}}\nlast!' }});
        var c = templates.load({main: {content: 'last!\n{{body}}\nlast!' }});
        var d = templates.load({alpha: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
        var e = templates.load({beta: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
        var f = templates.load({gamma: {layout: 'main', content: 'C above\n{{body}}\nC below' }});

console.log(templates.getTemplate('c'));

        // actual.should.eql(expected);
      });

      it('should load templates from strings', function () {
        var templates = new Loader();
        templates.load({base: {content: 'base!\n{{body}}\nbase!' }});
        templates.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
        templates.load({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
        var a = templates.load({c: {layout: 'base', content: 'C above\n{{body}}\nC below' }});
        var b = templates.load({main: {content: 'last!\n{{body}}\nlast!' }});
        var c = templates.load({main: {content: 'last!\n{{body}}\nlast!' }});
        var d = templates.load({alpha: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
        var e = templates.load({beta: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
        var f = templates.load({gamma: {layout: 'main', content: 'C above\n{{body}}\nC below' }});


        // actual.should.eql(expected);
      });
    });
  });
});