/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

require('should');
var _ = require('lodash');
var path = require('path');
var chalk = require('chalk');
var Loader = require('..');
var loader;

describe(chalk.magenta('utils:'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe('hasOwn():', function () {
    it('should return `true` if `object` hasOwnProperty `key`:', function () {
      Loader.hasOwn({a: 'b'}, 'a').should.be.true;
    });

    it('should return `false` if the `object` does not:', function () {
      Loader.hasOwn({a: 'b'}, 'b').should.be.false;
    });
  });

  describe('locals:', function () {
    describe('.pickLocals():', function () {
      it('should pick locals from the given object:', function () {
        var locals = Loader.pickLocals({a: 'b', locals: {c: 'd'}, content: 'This is content.'});
        locals.should.eql({a: 'b', locals: {c: 'd'}});
      });

      it('should return an empty object when no relevant props are found:', function () {
        Loader.pickLocals({content: 'This is content.'}).should.eql({});
        Loader.pickLocals({}).should.eql({});
      });
    });

    describe('.flattenProp():', function () {
      it('should throw an error when `prop` is not defined', function () {
        (function () {
          Loader.flattenProp({});
        }).should.throw('flattenProp expects `prop` to be a string.');
      });

      it('should flatten the given prop to the root when one object is passed:', function () {
        Loader.flattenProp('locals', {a: 'b'}).should.eql({a: 'b'});
        Loader.flattenProp('locals', {a: 'b', locals: {c: 'd'}}).should.eql({a: 'b', c: 'd'});
        Loader.flattenProp('locals', {locals: {c: 'd'}}).should.eql({c: 'd'});
      });

      it('should flatten the given prop to the root when two objects are passed:', function () {
        var locs = {locals: {c: 'd'}};
        var opts = {locals: {a: 'b'}};
        Loader.flattenProp('locals', locs, opts).should.eql({a: 'b', c: 'd'});
        locs.should.eql({a: 'b', c: 'd'});
        opts.should.eql({});
      });
    });
  });

  describe('root:', function () {
    describe('.pickRoot():', function () {
      it('should pick root properties from the given object:', function () {
        var root = Loader.pickRoot({a: 'b', locals: {c: 'd'}, content: 'This is content.'});
        root.should.eql({content: 'This is content.', locals: {c: 'd'}});
      });

      it('should allow custom `root` keys to be defined:', function () {
        var root = Loader.pickRoot({a: 'b', locals: {c: 'd'}, content: 'This is content.'}, ['a']);
        root.should.eql({a: 'b', content: 'This is content.', locals: {c: 'd'}});
      });
    });
  });
});
