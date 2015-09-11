var path = require('path');
var loader = require('./');
var cache = {};

var views = loader(cache, function (file) {
  if (file.path.slice(-4) === 'json') {
    var obj = require(path.resolve(file.path));
    for (var key in obj) {
      file[key] = obj[key];
    }
  }
  return file;
});

var opts = {
  cwd: 'test/fixtures',
  renameKey: function (key) {
    return key;
  }
};

views('home', {contents: '...'});
views('test/fixtures/a.md', {
  renameKey: function (key) {
    return key;
  }
});

views(['*.txt'], opts);
views('b.md', opts, {name: 'Halle'});
views('c.md', opts);
views('test/fixtures/[a-b].hbs');
views(['test/fixtures/c*.hbs']);
views({
  foo: {contents: '...'},
  bar: {contents: '...'},
  baz: {contents: '...'}
});
views('*.json', opts);

console.log(cache)
