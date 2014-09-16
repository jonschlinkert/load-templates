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
var matter = require('gray-matter');
var Loader = require('..');
var loader;
var _ = require('lodash');


var fixture = function(filepath) {
  return path.join(__dirname, 'fixtures/' + filepath)
    .replace(/[\\\/]/g, '/');
};

var options = {
  normalize: function (key, value, locals, options) {
    locals = locals || {};
    options = options || locals.options || {};
    var obj = {};

    if (typeof value === 'string') {
      obj = loader.parse(value, options);
    } else {
      obj = value;
    }

    obj.path = obj.path || key;
    obj.locals = _.omit(locals, ['options']);
    obj.options = options;
    return obj;
  }
};

// var locals = {
//   options: options
// };

// var manyObj = {};

// glob.sync('fixtures/three/*.md').forEach(function(fp) {
//   // load.loadOne(fp, matter.read(fp), locals);
//   manyObj[fp] = {content: load.read(fp)};
// });

// glob.sync('fixtures/two/*.md').forEach(function(fp) {
//   load.loadOne(fp, fs.readFileSync(fp, 'utf8'), locals);
// });

// var many = glob.sync('fixtures/one/*.md');

// load.set('home', '');
// console.log(o)
// console.log(load.loadMany(many));
// load.loadMany(many, locals);
// load.loadMany('fixtures/two/*.md', locals);
// load.loadMany(manyObj, locals);
// console.log(o);


describe('.detectPath()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('.read():', function () {
    it('should use the default read method.', function () {
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('content', 'This is fixture a.txt');
    });

    it('should use a user-defined read method defined on the constructor.', function () {
      loader = new Loader({
        read: function(filepath) {
          return fs.readFileSync(filepath, 'utf8') + ':foo';
        }
      });

      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('content', 'This is fixture a.txt:foo');
    });
  });

  describe('.parse():', function () {
    it('should use the default `.parse()` method.', function () {
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').data.should.have.property('title', 'AAA');
    });

    it('should use a user-defined `.parse()` method defined on the constructor.', function () {
      loader = new Loader({
        parse: function(str) {
          return _.extend(matter(str), {foo: 'bar'});
        }
      });
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('foo', 'bar');
    });
  });

  describe.skip('.normalize():', function () {
    it('should use the default `.normalize()` method.', function () {
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').data.should.have.property('title', 'AAA');
    });

    it('should use a user-defined `.normalize()` method defined on the constructor.', function () {
      loader = new Loader({
        normalize: function(key, value, locals, options) {
          return key;
        }
      });
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.eql({content: 'a.txt'});
    });

    it('should use a user-defined `.normalize()` method defined on the constructor.', function () {
      loader = new Loader({
        normalize: function(key, value, locals, options) {
          value.locals = {foo: 'bar'};
          return value;
        }
      });
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('data');
      loader.get('a.txt').should.have.property('locals', {foo: 'bar'});
    });
  });

  describe('.renameKey():', function () {
    it('should use the default renameKey method.', function () {
      loader.load('test/fixtures/*.txt', true);
      loader.get('a.txt').should.have.property('path', 'test/fixtures/a.txt');
    });

    it('should use a user-defined renameKey method defined on the constructor.', function () {
      loader = new Loader({
        renameKey: function(filepath) {
          return path.basename(filepath, path.extname(filepath));
        }
      });
      loader.load('test/fixtures/*.txt', true);
      loader.cache.should.have.property('a');
      loader.get('a').should.have.property('path', 'test/fixtures/a.txt');
    });
  });


  describe('when the key is a string:', function () {
    it('should load when the content is a string.', function () {
      loader.load('a.md', 'b');
      loader.get('a.md').should.have.property('content', 'b');
    });

    it('should load when content is a property on an object.', function () {
      loader.load('a.md', {content: 'c'});
      loader.get('a.md').should.have.property('content', 'c');
    });

    it('should load templates onto the cache:', function () {
      loader.load('a.md', {content: 'c'});
      loader.cache['a.md'].should.have.property('content', 'c');
    });

    it('should load when the key is a filepath.', function () {
      loader.load('test/fixtures/*.md', true);
      loader.get('a.md').should.have.property('path', 'test/fixtures/a.md');
      loader.get('a.md').should.have.property('content', 'This is fixture a.md');
    });
  });
});


describe('loader', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('string', function () {
    it('should load templates from a string glob pattern', function () {
      loader.load('test/fixtures/**/*.{txt,md}', true);
      loader.should.be.an.object;
    });

    it('should normalize data passed as a second param', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward', a: 'b'}, true);
      loader.cache.should.be.an.object;
      loader.get('a.txt').should.have.property('data');
      loader.get('a.txt').locals.name.should.equal('Brian Woodward');
    });

    it('should create a path property from the filepath.', function () {
      loader.load('test/fixtures/*.txt', {name: 'Brian Woodward'}, true);
      loader.cache.should.be.an.object;
      loader.get('a.txt').should.have.property('path');
    });

    it.only('should normalize content passed as a second param', function () {
      loader.load('foo/bar/abc.md', 'This is content.', {name: 'Jon Schlinkert'});
      loader.cache.should.be.an.object;
      console.log(loader.cache)

      loader.get('abc.md').should.have.property('locals');
      loader.get('abc.md').content.should.equal('This is content.');
      loader.get('abc.md').locals.name.should.equal('Jon Schlinkert');
    });

    it('should normalize locals passed as a second param', function () {
      loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);
      loader.cache.should.be.an.object;
      loader.get('a.txt').should.have.property('locals');
      loader.get('a.txt').locals.name.should.equal('Brian Woodward');
    });
  });

  describe('array', function () {
    it('should load templates from an array glob pattern', function () {
      loader.load(['test/fixtures/*.txt'], true);

      loader.cache.should.be.an.object;
      loader.get('a.txt').should.have.property('path');
      loader.get('a.txt').should.have.property('data');
      loader.get('a.txt').should.have.property('content');
    });

    it('should normalize locals passed as a second param', function () {
      loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);

      loader.cache.should.be.an.object;
      loader.get('a.txt').should.have.property('locals');
      loader.get('a.txt').locals.name.should.equal('Brian Woodward');
    });

    it('should create a path property from the filepath.', function () {
      loader.load(['test/fixtures/*.txt'], {name: 'Brian Woodward'}, true);

      loader.cache.should.be.an.object;
      loader.get('a.txt').should.have.property('path');
    });
  });

  describe('object', function () {
    it('should load loader from an object', function () {
      loader.load({'foo/bar.md': {content: 'this is content.'}});

      loader.cache.should.be.an.object;
      loader.get('bar.md').should.have.property('path');
      loader.get('bar.md').should.have.property('locals');
      loader.get('bar.md').should.have.property('content');
    });

    it('should normalize locals passed as a second param', function () {
      loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});
      loader.cache.should.be.an.object;
      loader.get('bar.md').should.have.property('locals');
      loader.get('bar.md').locals.should.eql({foo: 'bar'});
    });
  });
});

// describe('template load:', function () {
//   describe('.load():', function () {
//     describe('when template are defined as objects:', function () {

//       // it('should load loader from objects:', function () {
//       //   loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});

//       //   templates.should.have.property('a');
//       //   templates.a.data.should.have.property('layout');
//       // });

//       // it('should load multiple loader from objects:', function () {
//       //   var a = loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
//       //   var b = loader.load({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
//       //   var c = loader.load({c: {layout: 'd', content: 'C above\n{{body}}\nC below' }});

//       //   a.should.have.property('a');
//       //   a.a.data.should.have.property('layout');
//       //   b.should.have.property('b');
//       //   b.b.data.should.have.property('layout');
//       //   c.should.have.property('c');
//       //   c.c.data.should.have.property('layout');
//       // });

//       it('should load loader from strings', function () {
//         var a = loader.load('a', 'A above\n{{body}}\nA below', {layout: 'b'});
//         var b = loader.load('b', 'B above\n{{body}}\nB below', {layout: 'c'});
//         var c = loader.load('c', 'C above\n{{body}}\nC below', {layout: 'd'});

//         a.should.have.property('a');
//         a.a.content.should.equal('A above\n{{body}}\nA below');
//         // a.a.data.should.have.property('layout');
//         // b.should.have.property('b');
//         // b.b.data.should.have.property('layout');
//         // c.should.have.property('c');
//         // c.c.data.should.have.property('layout');
//       });

//       it('should load loader from strings', function () {
//         var a = loader.load('a', {content: 'A above\n{{body}}\nA below', layout: 'b'});
//         var b = loader.load('b', {content: 'B above\n{{body}}\nB below', layout: 'c'});
//         var c = loader.load('c', {content: 'C above\n{{body}}\nC below', layout: 'd'});

//         a.should.have.property('a');
//         a.a.content.should.equal('A above\n{{body}}\nA below');
//         // a.a.data.should.have.property('layout');
//         // b.should.have.property('b');
//         // b.b.data.should.have.property('layout');
//         // c.should.have.property('c');
//         // c.c.data.should.have.property('layout');
//       });
//     });
//   });
// });

// describe('loader', function () {
//   describe('string', function () {
//     it('should load templates from a string glob pattern', function () {
//       loader.load('pages/*.txt');

//       templates.should.be.an.object;
//       templates[key].should.have.property('path');
//       templates[key].should.have.property('data');
//       templates[key].should.have.property('content');
//     });

//     it('should normalize data passed as a second param', function () {
//       loader.load('pages/*.txt', {name: 'Brian Woodward'});

//       templates.should.be.an.object;
//       templates[key].should.have.property('data');
//       templates[key].data.name.should.equal('Brian Woodward');
//     });

//     it('should create a path property from the filepath.', function () {
//       loader.load('pages/*.txt', {name: 'Brian Woodward'});

//       templates.should.be.an.object;
//       templates[key].should.have.property('path');
//     });

//     it('should normalize content passed as a second param', function () {
//       loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});

//       templates.should.be.an.object;
//       templates[key].should.have.property('data');
//       templates[key].content.should.equal('This is content.');
//       templates[key].data.name.should.equal('Jon Schlinkert');
//     });

//     it('should normalize data passed as a second param', function () {
//       loader.load(['pages/*.txt'], {name: 'Brian Woodward'});

//       templates.should.be.an.object;
//       templates[key].should.have.property('data');
//       templates[key].data.name.should.equal('Brian Woodward');
//     });
//   });
// });