/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var loader = require('..');


describe('defaults', function () {
  it('should have an empty cache object:', function () {
    loader.template.cache.should.be.an.object;
    loader.template.cache.should.be.empty;
  });

  it('should have an empty templates array:', function () {
    loader.template.array.should.be.an.array;
    loader.template.array.should.be.empty;
  });
});

describe('when no content or path properties are found:', function () {
  it('should extend templates onto the `templates.cache` object:', function () {
    loader.normalize('a/b/d.md', {name: 'Brian Woodward'});
    loader.template.cache.should.have.property('__id__1', {value: 'a/b/d.md', locals: {name: 'Brian Woodward'}});
    loader.template.get('__id__1').should.have.property('value', 'a/b/d.md');
    loader.template.get('__id__1').should.have.property('locals', {name: 'Brian Woodward'});
  });

  it('should push templates in the `templates.array`:', function () {
    loader.normalize('a/b/d.md', {name: 'Brian Woodward'});
    loader.template.array.should.containEql({value: 'a/b/d.md', locals: {name: 'Brian Woodward'}});
  });
});


describe('when a string [string|object] pattern is used:', function () {
  it('should detect when the string is a filepath:', function () {
    var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});
    files['test/fixtures/one/a.md'].should.have.property('path', 'test/fixtures/one/a.md');
  });

  it('should read the file when the string is a valid filepath:', function () {
    var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});
    files['test/fixtures/one/a.md'].should.have.property('content', 'This is {{title}}');
  });

  it('should get locals from the second argument:', function () {
    var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});
    files['test/fixtures/one/a.md'].should.have.property('locals', {name: 'Brian Woodward'});
  });

  it('should get options from the third argument:', function () {
    var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'}, {doStuff: true});
    files['test/fixtures/one/a.md'].should.have.property('options', {doStuff: true});
    files['test/fixtures/one/a.md'].locals.should.not.have.property('doStuff');
  });

  it('should move arbitrary props on the second arg to `locals`:', function () {
    var files = loader.normalize('a', {content: 'this is content', layout: 'b'});
    files['a'].should.have.property('locals', {layout: 'b'});
  });

  it('should move arbitrary props on the third arg to `options`:', function () {
    var files = loader.normalize('test/fixtures/*.md', {a: 'b'}, {
      engine: 'hbs'
    });
    files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
    files['test/fixtures/a.md'].should.have.property('options', {engine: 'hbs'});
  });

  it('should load individual templates:', function () {
    var files = loader.normalize('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
    files['foo1.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
    files['bar1.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
    files['baz.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
    files['a.txt'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize('test/fixtures/a.md', {foo: 'bar'});
    files['a.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
    files['abc.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize('test/fixtures/b.md', 'This is content.', {name: 'Jon Schlinkert'});
    files['b.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
    files['foo/bar.md'].should.have.property('content');
  });

  it('should load individual templates:', function () {
    var files = loader.normalize({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});
    files['two.md'].should.have.property('content', 'this is content.');
    files['two.md'].should.have.property('data', {b: 'b'});
  });

  it('should load individual templates:', function () {
    var files = loader.normalize({'foo/baz.md': {}}, {blah: 'blah'}); // bad format
    files['baz.md'].should.have.property('content');
  });
});

describe('when templates are formatted as strings', function () {
  describe('load individual templates', function () {
    it('should detect content when passed as a second param', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files['abc.md'].should.have.property('content', 'This is content.');
    });

    it.skip('should detect locals when passed as a second param', function () {
      var files = loader.normalize('whatever', {name: 'Brian Woodward'});
      files['whatever'].should.have.property('locals', {name: 'Brian Woodward'});
    });

    it.skip('should return `{content: null}` when content is not defined or detected.', function () {
      var files = loader.normalize('whatever', {name: 'Brian Woodward'});
      files['whatever'].should.have.property('content', null);
    });
  });

  describe('when the key is a non-filepath, non-glob string:', function () {
    it('should load even if the key is an invalid filepath.', function () {
      var files = loader.normalize('a.md');
      files.should.have.property('__id__1');
    });

    it('should load even if the key is an invalid filepath.', function () {
      var files = loader.normalize('a.md', 'b');
      files['a.md'].should.have.property('content', 'b');
    });

    it('should load when content is a property on an object.', function () {
      var files = loader.normalize('a.md', {content: 'c'});
      files['a.md'].should.have.property('content', 'c');
    });

    it('should normalize content passed as a second param', function () {
      var files = loader.normalize('foo/bar/abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files.should.be.an.object;
      files['foo/bar/abc.md'].should.have.property('locals');
      files['foo/bar/abc.md'].content.should.equal('This is content.');
      files['foo/bar/abc.md'].locals.name.should.equal('Jon Schlinkert');
    });

    describe('when the second arg is a string:', function () {
      it('should use the first arg', function () {
        var files = loader.normalize('a', 'A above\n{{body}}\nA below', {layout: 'b'});
        files.should.have.property('a');
        files.a.content.should.equal('A above\n{{body}}\nA below');
        files.a.locals.should.have.property('layout');
      });
      it('should use the first arg', function () {
        var files = loader.normalize('b', 'B above\n{{body}}\nB below', {layout: 'c'});
        files.should.have.property('b');
        files.b.locals.should.have.property('layout');
      });
      it('should use the first arg', function () {
        var files = loader.normalize('c', 'C above\n{{body}}\nC below', {layout: 'd'});
        files.should.have.property('c');
        files.c.locals.should.have.property('layout');
      });
    });

    describe('when the second arg is an object:', function () {
      it('should use the first arg as the key.', function () {
        var files = loader.normalize('a', {content: 'A above\n{{body}}\nA below', layout: 'b'});
        files.should.have.property('a');
        files.a.content.should.equal('A above\n{{body}}\nA below');
        files.a.locals.should.have.property('layout');
      });
    });
  });

  describe('load multiple templates:', function () {
    it('should load the template onto the cache:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files.should.be.an.object;
      files['test/fixtures/a.txt'].should.exist;
    });

    it('should detect locals passed as a second param', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('locals');
      files['test/fixtures/a.txt'].locals.should.have.property('name', 'Brian Woodward');
    });

    it('should create the `path` property from the filepath.', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
    });

    it('should get front-matter from files:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
    });

    it('should load templates from a string glob pattern', function () {
      var files = loader.normalize('test/fixtures/*.txt');

      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
      files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
      files['test/fixtures/a.txt'].should.not.have.property('locals');
      files['test/fixtures/a.txt'].should.have.property('content', 'This is from a.txt.');
    });

    describe('when the key is a glob pattern:', function () {
      it('should load when the key is a filepath.', function () {
        var files = loader.normalize('test/fixtures/*.md');
        files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
        files['test/fixtures/a.md'].should.have.property('content', 'This is fixture a.md');
      });

      it('should load templates from a string glob pattern', function () {
        var files = loader.normalize('test/fixtures/**/*.{txt,md}');
        loader.should.be.an.object;
      });

      it('should normalize data passed as a second param', function () {
        var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward', a: 'b'});
        files.should.be.an.object;
        files['test/fixtures/a.txt'].should.have.property('data');
        files['test/fixtures/a.txt'].locals.name.should.equal('Brian Woodward');
      });

      it('should create a path property from the filepath.', function () {
        var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
        files.should.be.an.object;
        files['test/fixtures/a.txt'].should.have.property('path');
      });

      it('should normalize locals passed as a second param', function () {
        var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});
        files.should.be.an.object;
        files['test/fixtures/a.txt'].should.have.property('locals');
        files['test/fixtures/a.txt'].locals.name.should.equal('Brian Woodward');
      });
    });

    it('should detect locals passed as a second param', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('locals');
      files['test/fixtures/a.txt'].locals.should.have.property('name', 'Brian Woodward');
    });

    it('should create the `path` property from the filepath.', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
    });

    it('should get front-matter from files:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
    });

    it('should detect locals when passed as a second param', function () {
      var files = loader.normalize(['test/fixtures/three/*.md'], {name: 'Brian Woodward'});
      files['test/fixtures/three/i.md'].should.have.property('locals', {name: 'Brian Woodward'});
    });
  });

  describe('when a string [string|object] pattern is used:', function () {
    it('should detect when the string is a filepath:', function () {
      var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});

      files['test/fixtures/one/a.md'].should.have.property('data', {title: 'A'});
      files['test/fixtures/one/a.md'].should.have.property('content');
    });

    it.skip('should load [string|object]:', function () {
      var files = loader.normalize(['test/fixtures/*.md', 'test/fixtures/*.txt'], {a: 'b'}, {
        engine: 'hbs'
      });
      files['a.md'].should.have.property('locals', {a: 'b'});
      files['a.md'].should.have.property('options', {engine: 'hbs'});
    });

    it('should load individual templates:', function () {
      var files = loader.normalize('test/fixtures/three/*.md', {name: 'Brian Woodward'});
      files['test/fixtures/three/g.md'].should.have.property('content');
    });

    it('should NOT resolve glob patterns when second value is a string:', function () {
      var files = loader.normalize('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
      files['test/fixtures/*.md'].should.have.property('content', 'flflflfl');
    });

    it('should load individual templates:', function () {
      var files = loader.normalize('test/fixtures/*.md', {name: 'Brian Woodward'});
      files['test/fixtures/a.md'].should.have.property('content', 'This is fixture a.md');
    });

  });

  describe('when templates are formatted as arrays', function () {
    it('should load templates from an array glob pattern', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);

      files['test/fixtures/a.txt'].should.have.property('path');
      files['test/fixtures/a.txt'].should.have.property('data',  { title: 'AAA' });
      files['test/fixtures/a.txt'].should.have.property('content', 'This is from a.txt.');
    });

    it('should normalize locals passed as a second param', function () {
      var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});

      files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
      files['test/fixtures/a.txt'].should.have.property('locals', {name: 'Brian Woodward'});
    });

    it('should create a path property from the filepath.', function () {
      var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
    });
  });
  describe('when templates are formatted as objects', function () {

    it('should load loader from an object', function () {
      var files = loader.normalize({'foo/bar.md': {content: 'this is content.'}});

      files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
      files['foo/bar.md'].should.not.have.property('locals');
      files['foo/bar.md'].should.have.property('content', 'this is content.');
    });

    it('should normalize locals passed as a second param', function () {
      var files = loader.normalize({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});

      files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
      files['foo/bar.md'].should.have.property('locals', {foo: 'bar'});
      files['foo/bar.md'].locals.should.eql({foo: 'bar'});
    });

    it('should use the key as the `path`:', function () {
      var files = loader.normalize({a: {content: 'A above\n{{body}}\nA below' , layout: 'b'}});

      files['a'].should.have.property('path', 'a');
      files['a'].should.have.property('locals');
      files['a'].locals.should.have.property('layout', 'b');
    });
  });
  describe('when templates are formatted as objects', function () {
    it('should load multiple templates from objects:', function () {
      var files = loader.normalize({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
      files.should.have.property('a');
      files.a.locals.should.have.property('layout');
    });
    it('should load multiple templates from objects:', function () {
      var files = loader.normalize({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
      files.should.have.property('b');
      files.b.locals.should.have.property('layout');
    });
    it('should load multiple templates from objects:', function () {
      var files = loader.normalize({c: {layout: 'd', content: 'C above\n{{body}}\nC below' }});
      files.should.have.property('c');
      files.c.locals.should.have.property('layout');
    });
  });


});
