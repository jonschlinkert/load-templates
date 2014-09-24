'use strict';

var util = require('util');
var path = require('path');
var extend = require('mixin-deep');
var normalize = require('./');


function firstIndexOfType(type, arr) {
  var len = arr.length;
  var val = null;

  for (var i = 0; i < len; i++) {
    if (typeof arr[i] === type) {
      return i;
    }
  }
  return val;
}

function Engine(options) {
  this.options = options || {};
  this.cache = {};
  this.defaultTemplates(this.options);
}


Engine.prototype.defaultTemplates = function (options) {
  this.create('partial', 'partials', options);
  this.create('layout', 'layouts', options);
  this.create('page', 'pages', options);
};


Engine.prototype.normalize = function () {
  var opts = extend({}, this.options);
  return normalize(opts).apply(null, arguments);
};


Engine.prototype.create = function (type, plural, options) {
  this.cache[plural] = this.cache[plural] || {};


  Engine.prototype[type] = function (key, value, locals, options) {
    this[plural](key, value, locals, options);
  };

  Engine.prototype[plural] = function (key, value, locals, options) {
    var files = this.normalize(key, value, locals, options);
    extend(this.cache[plural], files);
    return this;
  };

  return this;
};

var engine = new Engine({
  renameKey: function (filepath) {
    return path.basename(filepath);
  },
  // parseFn: function (filepath) {
  //   return matter.read(filepath);
  // },
});


engine.page('fixtures/two/*.md', {name: 'Brian Woodward'});
engine.page('test/fixtures/three/*.md', {name: 'Brian Woodward'});
engine.page('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
engine.page({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
engine.page({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
engine.page(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
engine.page('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
engine.page('layouts/*.txt', {name: 'Brian Woodward'});
engine.page('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'});

engine.page('test/fixtures/a.md', {foo: 'bar'});
engine.page('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
engine.page('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'});
engine.page({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
engine.page({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});

var cache = util.inspect(engine, null, 10);
console.log(cache);


// var templates = [];

// templates.push(normalize('fixtures/two/*.md', {name: 'Brian Woodward'}));
// templates.push(normalize('test/fixtures/three/*.md', {name: 'Brian Woodward'}));
// templates.push(normalize('foo1.md', 'This is content', {name: 'Jon Schlinkert'}));
// templates.push(normalize({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}));
// templates.push(normalize({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true}));
// templates.push(normalize(['test/fixtures/a.txt'], {name: 'Brian Woodward'}));
// templates.push(normalize('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'}));
// templates.push(normalize('layouts/*.txt', {name: 'Brian Woodward'}));
// templates.push(normalize('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'}));

// templates.push(normalize('test/fixtures/a.md', {foo: 'bar'}));
// templates.push(normalize('abc.md', 'This is content.', {name: 'Jon Schlinkert'}));
// templates.push(normalize('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'}));
// templates.push(normalize({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}}));
// templates.push(normalize({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}}));

// var cache = util.inspect(templates, null, 10);
// console.log(cache);