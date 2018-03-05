const Loader = require('..');
const loader = new Loader({
  renameKey: file => file.basename,
  onLoad: file => {
    console.log(file)
  }
});

const options = {
  cwd: 'test/fixtures',
  renameKey: file => {
    return file.basename;
  }
};

loader.load('home', { content: '...' });
loader.load('test/fixtures/a.md', {
  renameKey: file => {
    return file.key;
  }
});

loader.load(['*.txt'], options);
loader.load('b.md', {name: 'Halle'});
loader.load('c.md', options);
loader.load('test/fixtures/[a-b].hbs');
loader.load('test/fixtures/c*.hbs');
loader.load(['test/fixtures/c*.hbs']);
loader.load({
  foo: {content: '...'},
  bar: {content: '...'},
  baz: {content: '...'}
});
loader.load('*.json');

// console.log(loader.cache);
