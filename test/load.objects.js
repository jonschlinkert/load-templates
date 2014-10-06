/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var should = require('should');
var matter = require('gray-matter');
var utils = require('../lib/utils');
var Loader = require('..');
var loader = new Loader();

function heading(str) {
  return chalk.magenta(str) + chalk.bold(' pattern:');
}

function subhead(str) {
  return chalk.cyan(str);
}

describe(chalk.magenta('objects'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe(heading('[ object ]'), function () {
    describe('when templates are formatted as objects', function () {
      it('should load multiple templates from objects:', function () {
        var files = loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
        files.should.have.property('a');
        files.a.locals.should.have.property('layout');
      });
      it('should load multiple templates from objects:', function () {
        var files = loader.load({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
        files.should.have.property('b');
        files.b.locals.should.have.property('layout');
      });
      it('should load multiple templates from objects:', function () {
        var files = loader.load({c: {layout: 'd', content: 'C above\n{{body}}\nC below' }});
        files.should.have.property('c');
        files.c.locals.should.have.property('layout');
      });
    });

    it('should load loader from an object', function () {
      var files = loader.load({'foo/bar.md': {content: 'this is content.'}});
      files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
      files['foo/bar.md'].should.not.have.property('locals');
      files['foo/bar.md'].should.have.property('content', 'this is content.');
    });

    it('should normalize locals passed as a second param', function () {
      var files = loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});

      files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
      files['foo/bar.md'].should.have.property('locals', {foo: 'bar'});
      files['foo/bar.md'].locals.should.eql({foo: 'bar'});
    });

    it('should use the key as the `path`:', function () {
      var files = loader.load({a: {content: 'A above\n{{body}}\nA below' , layout: 'b'}});

      files['a'].should.have.property('path', 'a');
      files['a'].should.have.property('locals');
      files['a'].locals.should.have.property('layout', 'b');
    });
  });

  describe(heading('[ object | object ]'), function () {
    it('should make the second object locals when two objects are passed', function () {
      var files = loader.load({path: 'a.md', content: 'abc'}, {a: 'a'});
      files.should.eql({'a.md': {path: 'a.md', ext: '.md', content: 'abc', locals: {a: 'a'}}});
    });

    it('should detect options and locals on a complex template.', function () {
      var files = loader.load({path: 'a/b/c.md', content: 'this is content.', a: 'b', options: {y: 'z'}}, {c: 'd'}, {e: 'f'});
      files.should.eql({'a/b/c.md': {path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {a: 'b', c: 'd'}, options: {y: 'z', e: 'f'}}});
    });
  });

  describe(heading('[ objects ] (multiple templates):'), function () {
    describe('objects:', function () {
      it('should use `path` and/or `content` properties as indicators:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', ext: '.md', content: 'this is content.'},
          'a/b/b.md': {path: 'a/b/b.md', ext: '.md', content: 'this is content.'},
          'a/b/c.md': {path: 'a/b/c.md', ext: '.md', content: 'this is content.'}
        };

        var files = loader.load({
          'a/b/a.md': {content: 'this is content.'},
          'a/b/b.md': {content: 'this is content.'},
          'a/b/c.md': {content: 'this is content.'}
        });

        files.should.eql(expected);
      });

      it('should normalize locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', ext: '.md', content: 'this is content.', locals: {a: {b: 'c'}}},
          'a/b/b.md': {path: 'a/b/b.md', ext: '.md', content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {path: 'a/b/c.md', ext: '.md', content: 'this is content.'}
        };

        var files = loader.load({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        });

        files.should.eql(expected);
      });

      it('should normalize "method-locals":', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', ext: '.md', content: 'this is content.', locals: {a: {b: 'c'}, foo: 'bar'}},
          'a/b/b.md': {path: 'a/b/b.md', ext: '.md', content: 'this is content.', locals: {a: {c: 'd'}, foo: 'bar'}},
          'a/b/c.md': {path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {foo: 'bar'}}
        };

        var files = loader.load({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        }, {foo: 'bar'});

        files.should.eql(expected);
      });

      it('should normalize "method" locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', ext: '.md', content: 'this is content.', locals: {a: {b: 'c'}, bar: 'bar'}},
          'a/b/b.md': {path: 'a/b/b.md', ext: '.md', content: 'this is content.', locals: {a: {c: 'd'}, bar: 'bar'}},
          'a/b/c.md': {path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {bar: 'baz'}}
        };

        var files = loader.load({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}, bar: 'bar'},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}, bar: 'bar'}},
          'a/b/c.md': {content: 'this is content.'}
        }, {bar: 'baz'});

        files.should.eql(expected);
      });


      it('should normalize options:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', ext: '.md', content: 'this is content.', locals: {a: {b: 'c'}, bar: 'baz'}, options: {foo: true}},
          'a/b/b.md': {path: 'a/b/b.md', ext: '.md', content: 'this is content.', locals: {a: {c: 'd'}, bar: 'baz'}, options: {foo: true}},
          'a/b/c.md': {path: 'a/b/c.md', ext: '.md', content: 'this is content.', locals: {bar: 'baz'}, options: {foo: true}}
        };

        var files = loader.load({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        }, {bar: 'baz'}, {foo: true});

        files.should.eql(expected);
      });
    });
  });
});
