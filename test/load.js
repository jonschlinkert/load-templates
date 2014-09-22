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


describe('[string|object] pattern:', function () {
  describe('when the first argument is a valid filepath (string):', function () {
    it('should detect when the string is a filepath:', function () {
      var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});
      files['test/fixtures/one/a.md'].should.have.property('path', 'test/fixtures/one/a.md');
    });

    it('should read the file and return an object:', function () {
      var files = loader.normalize('test/fixtures/a.md');
      files['test/fixtures/a.md'].should.be.an.object;
    });

    it('should extend the object with `content` from the file:', function () {
      var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});
      files['test/fixtures/one/a.md'].should.have.property('content', 'This is {{title}}');
    });

    it('should extend the object with the `path` for the file:', function () {
      var files = loader.normalize('test/fixtures/a.md', {foo: 'bar'});
      files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
    });

    it('should extend the object with `locals`:', function () {
      var files = loader.normalize('test/fixtures/a.md', {foo: 'bar'});
      files['test/fixtures/a.md'].should.have.property('locals', {foo: 'bar'});
      files['test/fixtures/a.md'].locals.should.eql({foo: 'bar'});
    });

    it('should extend the object with `options`:', function () {
      var files = loader.normalize('test/fixtures/a.md', {foo: 'bar'}, {fez: true});
      files['test/fixtures/a.md'].should.have.property('options', {fez: true});

      // ensure that properties aren't bleeding to other objects, since we use arity to check
      files['test/fixtures/a.md'].options.should.eql({fez: true});
      files['test/fixtures/a.md'].locals.should.eql({foo: 'bar'});
    });

    it('should extend the object with `content`:', function () {
      var files = loader.normalize('test/fixtures/a.md', {foo: 'bar'});
      files['test/fixtures/a.md'].should.have.property('content', 'This is fixture a.md');
    });

    it('should parse front matter:', function () {
      var files = loader.normalize('test/fixtures/a.md', {foo: 'bar'});
      files['test/fixtures/a.md'].should.have.property('data', { title: 'AAA' });
      files['test/fixtures/a.md'].should.have.property('orig', '---\ntitle: AAA\n---\nThis is fixture a.md');
    });

    it('should load a template from the filepath:', function () {
      var files = loader.normalize('test/fixtures/a.txt', {name: 'Brian Woodward'});
      var expected = {
        data: { title: 'AAA' },
        content: 'This is from a.txt.',
        orig: '---\ntitle: AAA\n---\nThis is from a.txt.',
        path: 'test/fixtures/a.txt',
        locals: { name: 'Brian Woodward' }
      };
      files['test/fixtures/a.txt'].should.eql(expected);
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
  });

  describe('when the first argument is a non-filepath, non-glob pattern string:', function () {
    it('should move arbitrary props on the second arg to `locals`:', function () {
      var files = loader.normalize('a', {content: 'this is content', layout: 'b'});
      files['a'].should.have.property('locals', {layout: 'b'});
    });
    it('should move arbitrary props on the third arg to `options`:', function () {
      var files = loader.normalize('test/fixtures/*.md', {a: 'b'}, {engine: 'hbs'});
      files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/a.md'].should.have.property('options', {engine: 'hbs'});
    });

    it('should load individual templates:', function () {
      var files = loader.normalize('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
      files['foo1.md'].should.have.property('content');
    });

    describe('when a `content` prop and actual content cannot be found:', function () {
      it('should not add a content property:', function () {
        var files = loader.normalize({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
        files['bar1.md'].should.not.have.property('content');
      });

      it('should add other prorties found on the object:', function () {
        var files = loader.normalize({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
        files['baz.md'].should.have.property('path');
      });
    });

    it.skip('should detect locals when passed as a second param', function () {
      var files = loader.normalize('whatever', {name: 'Brian Woodward'});
      files['whatever'].should.have.property('locals', {name: 'Brian Woodward'});
    });

    it.skip('should return `{content: null}` when content is not defined or detected.', function () {
      var files = loader.normalize('whatever', {name: 'Brian Woodward'});
      files['whatever'].should.have.property('content', null);
    });


    it('should load when content is a property on an object.', function () {
      var files = loader.normalize('a.md', {content: 'c'});
      files['a.md'].should.have.property('content', 'c');
    });

    it.skip('should load even if the key is an invalid filepath.', function () {
      var files = loader.normalize('a.md');
      files.should.have.property('__id__1');
    });

    it.skip('should load even if the key is an invalid filepath.', function () {
      var files = loader.normalize('a.md', 'b');
      files['a.md'].should.have.property('content', 'b');
    });

    it('should normalize content passed as a second param', function () {
      var files = loader.normalize('foo/bar/abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files.should.be.an.object;
      files['foo/bar/abc.md'].should.have.property('locals');
      files['foo/bar/abc.md'].content.should.equal('This is content.');
      files['foo/bar/abc.md'].locals.name.should.equal('Jon Schlinkert');
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

});


describe('[string|string] pattern:', function () {
  describe('when the second argument is a string:', function () {
    it('should assume the second arg is `content`.', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files['abc.md'].should.have.property('content', 'This is content.');
    });

    it('should assume the first arg is the template key.', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files['abc.md'].should.have.property('path', 'abc.md');
    });

    it('should assume the key is not a file path.', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files['abc.md'].should.have.property('path', 'abc.md');
    });

    it('should move arbitrary, non-root properties on the third arg to the `locals` object.', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      files['abc.md'].should.have.property('locals', {name: 'Jon Schlinkert'});
      files['abc.md'].locals.should.eql({name: 'Jon Schlinkert'});
    });

    it('should move arbitrary, non-root properties on the fourth arg to the `options` object.', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'}, {foo: true});
      files['abc.md'].should.have.property('options', {foo: true});
      files['abc.md'].options.should.eql({foo: true});
    });

    it('should merge `options` found on the `locals` object.', function () {
      var files = loader.normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'}, {foo: true});
      files['abc.md'].should.have.property('locals', {name: 'Jon Schlinkert'});
      files['abc.md'].locals.should.eql({name: 'Jon Schlinkert'});
      files['abc.md'].should.have.property('options', {foo: true});
      files['abc.md'].options.should.eql({foo: true});
    });
  });
});


// describe.skip('when templates are formatted as strings', function () {


//   describe('load multiple templates:', function () {
//     it('should load the template onto the cache:', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files.should.be.an.object;
//       files['test/fixtures/a.txt'].should.exist;
//     });

//     it('should detect locals passed as a second param', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('locals');
//       files['test/fixtures/a.txt'].locals.should.have.property('name', 'Brian Woodward');
//     });

//     it('should create the `path` property from the filepath.', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
//     });

//     it('should get front-matter from files:', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
//     });

//     it('should load templates from a string glob pattern', function () {
//       var files = loader.normalize('test/fixtures/*.txt');

//       files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
//       files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
//       files['test/fixtures/a.txt'].should.not.have.property('locals');
//       files['test/fixtures/a.txt'].should.have.property('content', 'This is from a.txt.');
//     });

//     describe('when the key is a glob pattern:', function () {
//       it('should load when the key is a filepath.', function () {
//         var files = loader.normalize('test/fixtures/*.md');
//         files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
//         files['test/fixtures/a.md'].should.have.property('content', 'This is fixture a.md');
//       });

//       it('should load templates from a string glob pattern', function () {
//         var files = loader.normalize('test/fixtures/**/*.{txt,md}');
//         loader.should.be.an.object;
//       });

//       it('should normalize data passed as a second param', function () {
//         var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward', a: 'b'});
//         files.should.be.an.object;
//         files['test/fixtures/a.txt'].should.have.property('data');
//         files['test/fixtures/a.txt'].locals.name.should.equal('Brian Woodward');
//       });

//       it('should create a path property from the filepath.', function () {
//         var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//         files.should.be.an.object;
//         files['test/fixtures/a.txt'].should.have.property('path');
//       });

//       it('should normalize locals passed as a second param', function () {
//         var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});
//         files.should.be.an.object;
//         files['test/fixtures/a.txt'].should.have.property('locals');
//         files['test/fixtures/a.txt'].locals.name.should.equal('Brian Woodward');
//       });
//     });

//     it('should detect locals passed as a second param', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('locals');
//       files['test/fixtures/a.txt'].locals.should.have.property('name', 'Brian Woodward');
//     });

//     it('should create the `path` property from the filepath.', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
//     });

//     it('should get front-matter from files:', function () {
//       var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
//     });

//     it('should detect locals when passed as a second param', function () {
//       var files = loader.normalize(['test/fixtures/three/*.md'], {name: 'Brian Woodward'});
//       files['test/fixtures/three/i.md'].should.have.property('locals', {name: 'Brian Woodward'});
//     });
//   });

//   describe('when a string [string|object] pattern is used:', function () {
//     it('should detect when the string is a filepath:', function () {
//       var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});

//       files['test/fixtures/one/a.md'].should.have.property('data', {title: 'A'});
//       files['test/fixtures/one/a.md'].should.have.property('content');
//     });

//     it.skip('should load [string|object]:', function () {
//       var files = loader.normalize(['test/fixtures/*.md', 'test/fixtures/*.txt'], {a: 'b'}, {
//         engine: 'hbs'
//       });
//       files['a.md'].should.have.property('locals', {a: 'b'});
//       files['a.md'].should.have.property('options', {engine: 'hbs'});
//     });

//     it('should load individual templates:', function () {
//       var files = loader.normalize('test/fixtures/three/*.md', {name: 'Brian Woodward'});
//       files['test/fixtures/three/g.md'].should.have.property('content');
//     });

//     it('should NOT resolve glob patterns when second value is a string:', function () {
//       var files = loader.normalize('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
//       files['test/fixtures/*.md'].should.have.property('content', 'flflflfl');
//     });

//     it('should load individual templates:', function () {
//       var files = loader.normalize('test/fixtures/*.md', {name: 'Brian Woodward'});
//       files['test/fixtures/a.md'].should.have.property('content', 'This is fixture a.md');
//     });

//   });

//   describe('when templates are formatted as arrays', function () {
//     it('should load templates from an array glob pattern', function () {
//       var files = loader.normalize(['test/fixtures/*.txt']);

//       files['test/fixtures/a.txt'].should.have.property('path');
//       files['test/fixtures/a.txt'].should.have.property('data',  { title: 'AAA' });
//       files['test/fixtures/a.txt'].should.have.property('content', 'This is from a.txt.');
//     });

//     it('should normalize locals passed as a second param', function () {
//       var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});

//       files['test/fixtures/a.txt'].should.have.property('data', {title: 'AAA'});
//       files['test/fixtures/a.txt'].should.have.property('locals', {name: 'Brian Woodward'});
//     });

//     it('should create a path property from the filepath.', function () {
//       var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});
//       files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
//     });
//   });
//   describe('when templates are formatted as objects', function () {

//     it('should load loader from an object', function () {
//       var files = loader.normalize({'foo/bar.md': {content: 'this is content.'}});

//       files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
//       files['foo/bar.md'].should.not.have.property('locals');
//       files['foo/bar.md'].should.have.property('content', 'this is content.');
//     });

//     it('should normalize locals passed as a second param', function () {
//       var files = loader.normalize({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});

//       files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
//       files['foo/bar.md'].should.have.property('locals', {foo: 'bar'});
//       files['foo/bar.md'].locals.should.eql({foo: 'bar'});
//     });

//     it('should use the key as the `path`:', function () {
//       var files = loader.normalize({a: {content: 'A above\n{{body}}\nA below' , layout: 'b'}});

//       files['a'].should.have.property('path', 'a');
//       files['a'].should.have.property('locals');
//       files['a'].locals.should.have.property('layout', 'b');
//     });
//   });

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




// });
