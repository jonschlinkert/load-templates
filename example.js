'use strict';

var util = require('util');
var _ = require('lodash');
var loader = require('./');


function Engine(options) {
  this.init(options);
}


Engine.prototype.init = function(options) {
  this.cache = {};
  this.defaultTemplates(options);
};


Engine.prototype.defaultTemplates = function (options) {
  this.create('partial', 'partials', options);
  this.create('layout', 'layouts', options);
  this.create('page', 'pages', options);
};



Engine.prototype.create = function (type, plural, options) {
  this.cache[plural] = this.cache[plural] || {};

  Engine.prototype[type] = function (key, value, locals, options) {
    var args = [].slice.call(arguments);
    var files = loader.normalize.apply(null, args);
    _.extend(this.cache[plural], files);
  };

  Engine.prototype[plural] = function (patterns, locals, options) {
    var args = [].slice.call(arguments);

    if (!args.length) {
      return this.cache[plural];
    }

    var files = loader.normalize.apply(null, args);
    _.extend(this.cache[plural], files);
    return this;
  };

  return this;
};

var engine = new Engine({
  // renameKey: function (filepath) {
  //   return path.basename(filepath);
  // },
  // parse: function (filepath) {
  //   return matter.read(filepath);
  // },
  // normalize: function (file) {
  //   var keys = Object.keys(file);
  //   keys.forEach(function (k) {
  //     var v = file[k];
  //     v.path = k;
  //   });
  //   return file;
  // }
  // cwd: 'test/fixtures'
});

engine.layouts('test/fixtures/two/*.md', {name: 'Brian Woodward'});
// engine.layouts('test/fixtures/three/*.md', {name: 'Brian Woodward'});
// engine.page('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
// engine.page({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
// engine.page({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
// engine.pages(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
// engine.layouts('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
// engine.layouts('layouts/*.txt', {name: 'Brian Woodward'});
// engine.layouts('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'});

// engine.layouts('test/fixtures/a.md', {foo: 'bar'});
// engine.page('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
// engine.page('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'});
// engine.page({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
// engine.page({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});
// engine.page({'foo/baz.md': {}}, {blah: 'blah'}); // bad format

var cache = util.inspect(engine, null, 10);
console.log(cache);