/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template locals:', function () {
  describe('when a locals are defined on the constructor.', function () {
    var template = new Template({
      locals: {
        a: 'FIRST',
        b: 'SECOND',
        c: 'THIRD',
        d: 'FOURTH'
      }
    });

    it('should pass the context to templates:', function () {
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>', {layout: 'a'});
      var b = template.process('<%= partial("b") %>', {layout: 'b'});
      var c = template.process('<%= partial("c") %>', {layout: 'c'});
      var d = template.process('<%= partial("d") %>', {layout: 'last'});

      a.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      b.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nlast');
      c.should.equal('\nlast\n\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nlast');
      d.should.equal('\nlast\nThis is partial FOURTH\nlast');
    });
  });

  describe('when a layout is defined in `locals` on the options:', function () {
    var template = new Template({
      locals: {
        a: 'FIRST',
        b: 'SECOND',
        c: 'THIRD',
        d: 'FOURTH'
      }
    });

    it('should pass the context to templates:', function () {
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>', {layout: 'a'});
      var b = template.process('<%= partial("b") %>', {layout: 'b'});
      var c = template.process('<%= partial("c") %>', {layout: 'c'});
      var d = template.process('<%= partial("d") %>', {layout: 'last'});

      a.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      b.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nlast');
      c.should.equal('\nlast\n\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nlast');
      d.should.equal('\nlast\nThis is partial FOURTH\nlast');
    });
  });


  describe('when is passed directly to the process method.', function () {
    it('should pass the context to templates:', function () {
      var template = new Template({
        locals: {
          a: 'FIRST',
          b: 'SECOND',
          c: 'THIRD',
          d: 'FOURTH',
          layout: 'a'
        }
      });

      template.layout('a', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {layout: 'last'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>', {title: 'FIRST'});
      var b = template.process('<%= partial("b") %>', {title: 'SECOND'});
      var c = template.process('<%= partial("c") %>', {title: 'THIRD'});
      var d = template.process('<%= partial("d") %>', {title: 'FOURTH'});


      a.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      b.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial SECOND\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      c.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial THIRD\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      d.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FOURTH\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
    });
  });

});
