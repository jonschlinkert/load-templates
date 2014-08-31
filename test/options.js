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
  describe('.option()', function () {
    it('should get default options.', function () {
      var loader = new Loader();
      loader.option('locals').should.eql({});
      loader.option('rename').should.be.a.function;
      loader.option('cwd').should.equal(process.cwd());
    });

    it('should set and get an option.', function () {
      var loader = new Loader();
      loader.option('a', 'b');
      loader.option('a').should.equal('b');
    });

    it('should override default options.', function () {
      var loader = new Loader();
      loader.option('locals', {a: 'b'});
      loader.option('cwd', 'tmp');

      loader.option('locals').should.eql({a: 'b'});
      loader.option('cwd').should.equal('tmp');
    });
  });
});