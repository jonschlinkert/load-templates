/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var loader = require('..');


describe('template globals:', function () {
  describe('when context is passed to the constructor::', function () {
    it('when context is passed to the constructor:', function () {
      var templates = loader({
        title: 'Page!',
        layout: 'a'
      });

      templates.load({base: {content: 'base!\n{{body}}\nbase!' }});
    });
  });
});