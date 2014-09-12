## Methods

* `.sort`: Using [sort-object]
* `.normalize`
* `.rename`
* `.parse`



### Singular

**Accepted formats:**

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

### Plural

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

