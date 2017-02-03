var Loader = require('./');

var loader = new Loader({
  renameKey: function(file) {
    return file.basename;
  }
});

var opts = {
  cwd: 'test/fixtures',
  renameKey: function(file) {
    return file.basename;
  }
};

loader.load('home', {contents: '...'});
loader.load('test/fixtures/a.md', {
  renameKey: function(file) {
    return file.key;
  }
});

loader.load(['*.txt'], opts);
loader.load('b.md', opts, {name: 'Halle'});
loader.load('c.md', opts);
loader.load('test/fixtures/[a-b].hbs');
loader.load('test/fixtures/c*.hbs');
loader.load(['test/fixtures/c*.hbs']);
loader.load({
  foo: {contents: '...'},
  bar: {contents: '...'},
  baz: {contents: '...'}
});
loader.load('*.json', opts);

console.log(loader.cache);
