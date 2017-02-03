var path = require('path');
var Loader = require('./');

var loader = new Loader({
  renameKey: function(file) {
    return file.basename;
  }
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
views('test/fixtures/c*.hbs');
views(['test/fixtures/c*.hbs']);
views({
  foo: {contents: '...'},
  bar: {contents: '...'},
  baz: {contents: '...'}
});
views('*.json', opts);

console.log(cache)
