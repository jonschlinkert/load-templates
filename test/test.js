/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var Loader = require('..');
var loader = new Loader();


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


describe('.load()', function () {
  beforeEach(function() {
    loader = new Loader();
  });

  describe('when the key is a string:', function () {
    it('should load when the content is a string.', function () {
      var templates = loader.load('a.md', 'b');
      templates.get('a.md').should.have.property('content', 'b');
    });

    it('should load when content is a property on an object.', function () {
      var templates = loader.load('a.md', {content: 'c'});
      templates.get('a.md').should.have.property('content', 'c');
    });

    it('should load when the key is a filepath.', function () {
      var templates = loader.load('test/fixtures/*.md', true);
      console.log(templates)
      templates.get('a.md').should.have.property('content', 'c');
    });
  });
});


// describe('loader', function () {
//   beforeEach(function() {
//     loader = new Loader();
//   });

//   describe('string', function () {
//     it('should load templates from a string glob pattern', function () {
//       var templates = loader.load('test/fixtures/**/*.{txt,md}', true);
//       console.log(templates);
//       templates.should.be.an.object;
//     });

//     // it('should normalize data passed as a second param', function () {
//     //   var templates = loader.load('pages/*.txt', {name: 'Brian Woodward'});
//     //   var key = fixture('pages/a.txt');

//     //   templates.should.be.an.object;
//     //   templates.should.have.property(key);
//     //   templates[key].should.have.property('data');
//     //   templates[key].data.name.should.equal('Brian Woodward');
//     // });

//     // it('should create a path property from the filepath.', function () {
//     //   var templates = loader.load('pages/*.txt', {name: 'Brian Woodward'});
//     //   var key = fixture('pages/a.txt');

//     //   templates.should.be.an.object;
//     //   templates.should.have.property(key);
//     //   templates[key].should.have.property('path');
//     //   templates[key].path.should.equal(key);
//     // });

//     // it('should normalize content passed as a second param', function () {
//     //   var templates = loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
//     //   var key = 'abc.md';

//     //   templates.should.be.an.object;
//     //   templates.should.have.property(key);
//     //   templates[key].should.have.property('data');
//     //   templates[key].content.should.equal('This is content.');
//     //   templates[key].data.name.should.equal('Jon Schlinkert');
//     // });

//     // it('should normalize data passed as a second param', function () {
//     //   var templates = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
//     //   var key = fixture('pages/a.txt');

//     //   templates.should.be.an.object;
//     //   templates.should.have.property(key);
//     //   templates[key].should.have.property('data');
//     //   templates[key].data.name.should.equal('Brian Woodward');
//     // });
//   });

//   // describe('array', function () {
//   //   it('should load templates from an array glob pattern', function () {
//   //     var templates = loader.load(['pages/*.txt']);
//   //     var key = fixture('pages/a.txt');

//   //     templates.should.be.an.object;
//   //     templates.should.have.property(key);
//   //     templates[key].should.have.property('path');
//   //     templates[key].should.have.property('data');
//   //     templates[key].should.have.property('content');
//   //   });

//   //   it('should normalize data passed as a second param', function () {
//   //     var templates = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
//   //     var key = fixture('pages/a.txt');

//   //     templates.should.be.an.object;
//   //     templates.should.have.property(key);
//   //     templates[key].should.have.property('data');
//   //     templates[key].data.name.should.equal('Brian Woodward');
//   //   });

//   //   it('should create a path property from the filepath.', function () {
//   //     var templates = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
//   //     var key = fixture('pages/a.txt');

//   //     templates.should.be.an.object;
//   //     templates.should.have.property(key);
//   //     templates[key].should.have.property('path');
//   //     templates[key].path.should.equal(key);
//   //   });
//   // });

//   // describe('object', function () {
//   //   it('should load templates from an object', function () {
//   //     var templates = loader.load({'foo/bar.md': {content: 'this is content.'}});
//   //     var key = 'foo/bar.md';

//   //     templates.should.be.an.object;
//   //     templates.should.have.property(key);
//   //     templates[key].should.have.property('path');
//   //     templates[key].should.have.property('data');
//   //     templates[key].should.have.property('content');
//   //   });

//   //   it('should normalize data passed as a second param', function () {
//   //     var templates = loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});
//   //     var key = 'foo/bar.md';

//   //     templates.should.be.an.object;
//   //     templates.should.have.property(key);
//   //     templates[key].should.have.property('data');
//   //     templates[key].data.should.eql({foo: 'bar'});
//   //   });
//   // });
// });

// describe('template load:', function () {
//   describe('.load():', function () {
//     describe('when template are defined as objects:', function () {

//       // it('should load loader from objects:', function () {
//       //   var templates = loader.load({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});

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
//       var templates = loader.load('pages/*.txt');
//       var key = fixture('pages/a.txt');

//       templates.should.be.an.object;
//       templates.should.have.property(key);
//       templates[key].should.have.property('path');
//       templates[key].should.have.property('data');
//       templates[key].should.have.property('content');
//     });

//     it('should normalize data passed as a second param', function () {
//       var templates = loader.load('pages/*.txt', {name: 'Brian Woodward'});
//       var key = fixture('pages/a.txt');

//       templates.should.be.an.object;
//       templates.should.have.property(key);
//       templates[key].should.have.property('data');
//       templates[key].data.name.should.equal('Brian Woodward');
//     });

//     it('should create a path property from the filepath.', function () {
//       var templates = loader.load('pages/*.txt', {name: 'Brian Woodward'});
//       var key = fixture('pages/a.txt');

//       templates.should.be.an.object;
//       templates.should.have.property(key);
//       templates[key].should.have.property('path');
//       templates[key].path.should.equal(key);
//     });

//     it('should normalize content passed as a second param', function () {
//       var templates = loader.load('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
//       var key = 'abc.md';

//       templates.should.be.an.object;
//       templates.should.have.property(key);
//       templates[key].should.have.property('data');
//       templates[key].content.should.equal('This is content.');
//       templates[key].data.name.should.equal('Jon Schlinkert');
//     });

//     it('should normalize data passed as a second param', function () {
//       var templates = loader.load(['pages/*.txt'], {name: 'Brian Woodward'});
//       var key = fixture('pages/a.txt');

//       templates.should.be.an.object;
//       templates.should.have.property(key);
//       templates[key].should.have.property('data');
//       templates[key].data.name.should.equal('Brian Woodward');
//     });
//   });
// });