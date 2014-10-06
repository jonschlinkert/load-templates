/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var matter = require('gray-matter');
var should = require('should');
var utils = require('../lib/utils');
var Loader = require('..');
var loader = new Loader();


function heading(str) {
  return chalk.magenta(str) + chalk.bold(' pattern:');
}
function subhead(str) {
  return chalk.cyan(str);
}


describe('loader:', function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe('random usage', function () {
    it('should normalize a template with a non-filepath key.', function () {
      var files = loader.load('foo', {content: 'this is content.'});
      files.should.eql({'foo': {path: 'foo', content: 'this is content.'}});
    });

    it('should correctly detect options on a template with a non-filepath key.', function () {
      var files = loader.load('foo', {content: 'this is content.', a: 'b'}, {fez: 'foo'});
      files.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b'}, options: {fez: 'foo'}}});
    });

    it('should correctly detect locals on a template with a non-filepath key.', function () {
      var files = loader.load({'foo': {content: 'this is content.', a: 'b'}}, {fez: 'foo'});
      files.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b', fez: 'foo'}}});
    });

    it('random stuff', function () {
      var ctx = {
        locals: {
          engine: '_',
          name: 'Jon Schlinkert',
          layout: 'sidebar',
          helpers: {
            include: function(name) {
              var filepath = path.join('test/fixtures', name);
              return fs.readFileSync(filepath, 'utf8');
            },
            wrap: function(str) {
              return '(' + str + ')';
            }
          }
        },
      };

      var tmpl = loader.load('abc', {content: '<%= wrap(include("content.tmpl")) %> This is a page!'}, ctx);
      tmpl['abc'].should.have.properties('locals');
      tmpl['abc'].locals.should.have.properties('engine', 'layout', 'helpers');
    });

    it('should load multiple templates:', function () {
      var files = loader.load({
        'a/b/a.md': {content: 'this is content'},
        'a/b/b.md': {content: 'this is content'},
        'a/b/c.md': {content: 'this is content'}
      }, {a: 'b'}, {c: true});

      files['a/b/a.md'].should.have.property('path', 'a/b/a.md');
      files['a/b/b.md'].should.have.property('path', 'a/b/b.md');
      files['a/b/c.md'].should.have.property('path', 'a/b/c.md');

      files['a/b/a.md'].should.have.property('content', 'this is content');
      files['a/b/b.md'].should.have.property('content', 'this is content');
      files['a/b/c.md'].should.have.property('content', 'this is content');

      files['a/b/a.md'].should.have.property('locals', { a: 'b' });
      files['a/b/b.md'].should.have.property('locals', { a: 'b' });
      files['a/b/c.md'].should.have.property('locals', { a: 'b' });

      files['a/b/a.md'].should.have.property('options', { c: true } );
      files['a/b/b.md'].should.have.property('options', { c: true } );
      files['a/b/c.md'].should.have.property('options', { c: true } );
    });
  });
});