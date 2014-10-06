## Valid formats

**string key / string value**

```js
loader.load('blog', 'This is my blog.');

// with locals
loader.load('blog', 'This is my blog.', { title: 'Blog' });

// with options
loader.load('blog', 'This is my blog.', { title: 'Blog' }, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});
```

**string key / object value**

```js
loader.load('blog', { content: 'This is my blog.' });

// with locals (any of the following is valid)
loader.load('blog', { content: 'This is my blog.' }, { title: 'Blog' });
loader.load('blog', { content: 'This is my blog.', title: 'Blog' });
loader.load('blog', { content: 'This is my blog.', locals: { title: 'Blog' }});

// with options (any of the following is valid)
loader.load('blog', { content: 'This is my blog.' }, { title: 'Blog' }, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});
loader.load('blog', { content: 'This is my blog.' }, { title: 'Blog' }, { foo: true });
loader.load('blog', { content: 'This is my blog.' }, { title: 'Blog', options: { foo: true }});

loader.load('blog', { content: 'This is my blog.', locals: { title: 'Blog' }}, { foo: true });
loader.load('blog', { content: 'This is my blog.', locals: { title: 'Blog' }, options: { foo: true }});

loader.load('blog', { content: 'This is my blog.', title: 'Blog' }, { foo: true });
loader.load('blog', { content: 'This is my blog.', title: 'Blog', options: { foo: true }});
```

 - first arg can be a file-path
 - first arg can be a non-file-path string
 - first arg can be a glob pattern
 - second arg can a string
 - when the second arg is a string, the first arg cannot be a file path
 - the second can be an object
 - when the second arg is an object, it may _be_ locals
 - when the second arg is an object, it may _have_ an `options` property
 - the second can be an object
 - in this pattern, when a third arg exists, it _must be_ the options object.
 - when a third arg exists, the second arg may still have an options property
 - when a third arg exists, `options` and `locals.options` are merged.

**Examples:**

```js
loader.load('a/b/c.md');
loader.load('a/b/c.md', 'this is content');
loader.load('a/b/c.md', {content: 'this is content'});
loader.load('a/b/c.md', {path: 'a/b/c.md'});
loader.load('a/b/c.md', {path: 'a/b/c.md', content: 'this is content'});
loader.load('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b'});
loader.load('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b'}, {c: 'd'});
loader.load('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b', options: {c: 'd'}});
loader.load('a/b/c.md', {path: 'a/b/c.md', locals: {a: 'b'}, options: {c: 'd'}});
```

**File paths**

```js
loader.load('a/b.md');

// with locals
loader.load('a/b.md', { title: 'Blog' });

// with options
loader.load('a/b.md', { title: 'Blog' }, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});

// pass options on the locals object
loader.load('a/b.md', {title: 'Blog', options: {foo: true}});
```

**Glob patterns**

```js
loader.load('a/*.md');
loader.load(['a/*.md', 'b/*.md']);

// with locals
loader.load(['a/*.md', 'b/*.md'], {title: 'Blog'});

// with options
loader.load(['a/*.md', 'b/*.md'], {title: 'Blog'}, {
  renameKey: function(filepath) {
    return path.basename(filepath);
  }
});
```

## API

* `.loader.load`
* `.rename`
* `.parse`



### Examples


```js
// object
loader.load({path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}});

// loader.load to
{path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, locals: {}, options: {}}
```

Defined as strings:

```js
// string (second param is content)
loader.load(path, content, data, options);
```

In the following example, the key will not be read as a filepath.

```js
// example
loader.load('a/b/c.md', 'this is content', {a: 'b'}, {foo: 'bar'});

// loader.load to
{path: 'a/b/c.md', content: 'this is content', locals: {a: 'b'}, options: {foo: 'bar'}}
```

```js
// this format is only accepted with `files`
loader.load('a', {content: 'this is content', layout: 'b'})
```


```js
// string (second param will be ignored if it's a string)
loader.load('a/b/*.md', {a: 'b'}, {
  engine: 'hbs'
});

// array of strings
loader.load(['a/b/*.md', 'x/y/*.md'], {a: 'b'}, {
  engine: 'hbs'
});

// object
loader.load({
  'a/b/c.md': {path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, opts: {}},
  'a/b/c.md': {content: 'this is content', data: {a: 'b'}, opts: {}},
});

// array of objects
loader.load([
  {path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, opts: {}},
  {path: 'a/b/c.md', content: 'this is content', data: {a: 'b'}, opts: {}},
], {
  engine: 'hbs'
});
```


## Templates

An ideally formatted template looks something like this:

```js
{'template.hbs': {path: 'path/to/template.hbs', content: 'This is content', locals: {}, options: {}}}
```

## Scrubbing


### Multiple

* Glob (String)
* Glob (Array)
* Objects
* Array of objects

**Invalid**

* String as a second arg

### Single

* Key/value, locals, options
* Key/value, locals
* Object, locals, options
* Object, locals

**Invalid**

* File paths
* Glob patterns
* Array


## Detectors

### .detectSingle
### .detectMultiple

### .detectKey
### .detectString
#### .detectPath
#### .detectContent

### .detectObject (singular)
#### .detectOptions
#### .detectLocals

### .detectObjects (plural)


## Format

> Formatters use detectors to determine the correct value.

After the correct value is determined, the formatter _formats_ the value correctly and returns it.

### .formatPath
### .formatContent
