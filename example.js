var fs = require('fs');
var path = require('path');
var util = require('util');
var matter = require('gray-matter');
var _ = require('lodash');
var extend = _.extend;
var Loader = require('./');

function Engine(options) {
  // Loader.call(this, options);
  this.defaultTemplates();
}

// util.inherits(Engine, Loader);

Engine.prototype.defaultTemplates = function () {
  // this.create('partial', 'partials');
  this.create('layout', 'layouts');
  this.create('page', 'pages');
};

Engine.prototype.create = function (type, plural) {
  this.cache[plural] = this.cache[plural] || {};
  var loader = new Loader();

  Engine.prototype[type] = function (key, value, locals) {
    var args = [].slice.call(arguments);
    var files = loader.load.apply(loader, args);
    extend(this.cache[plural], files);
  };

  Engine.prototype[plural] = function (patterns, locals) {
    var args = [].slice.call(arguments);
    if (!args.length) {
      return this.cache[plural];
    }

    var files = loader.load.apply(loader, args.concat(true));
    extend(this.cache[plural], files);
    return this;
  };

  return this;
};

var engine = new Engine({
  rename: function (filepath) {
    return path.basename(filepath);
  },
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
  cwd: 'test/fixtures'
});

engine.layouts('test/fixtures/three/*.md', {name: 'Brian Woodward'});
// engine.page('foo.md', 'This is content', {name: 'Jon Schlinkert'});
engine.pages(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
engine.layouts('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
// engine.layouts('layouts/*.txt', {name: 'Brian Woodward'});
// engine.layouts('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'});

// engine.layouts('layouts/a.md', {foo: 'bar'});
// engine.page('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
// engine.page('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'});
// engine.page({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
// engine.page({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});
// engine.page({'foo/baz.md': {}}, {blah: 'blah'}); // bad format

var cache = util.inspect(engine.cache, null, 10);
console.log(cache);