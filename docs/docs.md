## Valid formats

**string key / string value**

```js
normalize('blog', 'This is my blog.');

// with locals
normalize('blog', 'This is my blog.', { title: 'Blog' });

// with options
normalize('blog', 'This is my blog.', { title: 'Blog' }, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});
```

**string key / object value**

```js
normalize('blog', { content: 'This is my blog.' });

// with locals (any of the following is valid)
normalize('blog', { content: 'This is my blog.' }, { title: 'Blog' });
normalize('blog', { content: 'This is my blog.', title: 'Blog' });
normalize('blog', { content: 'This is my blog.', locals: { title: 'Blog' }});

// with options (any of the following is valid)
normalize('blog', { content: 'This is my blog.' }, { title: 'Blog' }, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});
normalize('blog', { content: 'This is my blog.' }, { title: 'Blog' }, { foo: true });
normalize('blog', { content: 'This is my blog.' }, { title: 'Blog', options: { foo: true }});

normalize('blog', { content: 'This is my blog.', locals: { title: 'Blog' }}, { foo: true });
normalize('blog', { content: 'This is my blog.', locals: { title: 'Blog' }, options: { foo: true }});

normalize('blog', { content: 'This is my blog.', title: 'Blog' }, { foo: true });
normalize('blog', { content: 'This is my blog.', title: 'Blog', options: { foo: true }});
```

**File paths**

```js
normalize('a/b.md');

// with locals
normalize('a/b.md', { title: 'Blog' });

// with options
normalize('a/b.md', { title: 'Blog' }, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});

// pass options on the locals object
normalize('a/b.md', {title: 'Blog', options: {foo: true}});
```

**Glob patterns**

```js
normalize('a/*.md');
normalize(['a/*.md', 'b/*.md']);

// with locals
normalize(['a/*.md', 'b/*.md'], {title: 'Blog'});

// with options
normalize(['a/*.md', 'b/*.md'], {title: 'Blog'}, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});
```

## API

* `.normalize`
* `.rename`
* `.parse`



### Examples


```js
// object
normalize.file({path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}});

// normalizes to
{path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, locals: {}, options: {}}
```

Defined as strings:

```js
// string (second param is content)
normalize.file(path, content, data, options);
```

In the following example, the key will not be read as a filepath.

```js
// example
normalize.file('a/b/c.md', 'this is content', {a: 'b'}, {foo: 'bar'});

// normalizes to
{path: 'a/b/c.md', content: 'this is content', locals: {a: 'b'}, options: {foo: 'bar'}}
```

```js
// this format is only accepted with `files`
normalize.file('a', {content: 'this is content', layout: 'b'})
```


```js
// string (second param will be ignored if it's a string)
normalize.files('a/b/*.md', {a: 'b'}, {
  engine: 'hbs'
});

// array of strings
normalize.files(['a/b/*.md', 'x/y/*.md'], {a: 'b'}, {
  engine: 'hbs'
});

// object
normalize.files({
  'a/b/c.md': {path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, opts: {}},
  'a/b/c.md': {content: 'this is content', data: {a: 'b'}, opts: {}},
});

// array of objects
normalize.files([
  {path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, opts: {}},
  {path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, opts: {}},
], {
  engine: 'hbs'
});
```

