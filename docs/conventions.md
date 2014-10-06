## Examples format

In all of the examples:

 * `{ title: 'Blog' }` indicates `locals`
 * `{ foo: true }` indicates `options`


## Patterns

**key**

* `string`
* `string | string`
* `string | string | object`
* `string | string | object | object`

* `string | object`
* `string | object | object`

**filepath/glob**

* `string/array`
* `string/array | object`
* `string/array | object | object`

**object**

* `object`
* `object | object`
* `object | object | object`

## Concepts

### Root keys

Default properties to be expected on a "normalized" template object:

 * `path`: ideally, the absolute file path of the original template. This is useful when additional processing or re-processing of the file is necessary.
 * `content`: the entire contents of a file with `utf8` encoding.
 * `locals`:
 * `options`

Additional properties added by [gray-matter] when the template originates from a file path.

 * `data`
 * `orig`

The `value` property is used when only one argument is passed, it's a string, and it does not resolve to a file path.

 * `value`


### template object

 * Might have a `path` property. If NO `path` property exists, it will be populated with `key`.
 * If a `path` property exists, but no `key` exist the `path` property will be used to create the `key`.
 * Might have a `content` property
 * Might have a `locals` object (uses `flattenLocals`)
 * Cannot BE an `options` object
 * Might have an `options` object (uses `pickOptions`)

### locals object

 * Might also be a [template object].
 * Might have a `path` property. If NO `path` property exists, it will be populated with `key`.
 * Might have a `locals` object (uses `flattenLocals`)
 * Cannot BE an `options` object
 * Might have an `options` object (uses `pickOptions`)

### options object

 * Might have a `locals` object (uses `flattenOptions`)
 * Might have an `options` object


## Rules

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

### string / string

> First arg is **not** a file path or glob pattern.

#### string

1. Since it's not a file path, must be `content`
1. Since no other fields exist, content is returned on the [`value` property](#root-keys).

**Examples:**

```js
loader.load('This is content');
```

Results in:

```js
{ value: 'This is content' }
```

#### string | string

1. Non-filepath key will be added to the `name` property
1. Must be `content`

**Examples:**

```js
loader.load('about', 'This is content');
```

Results in:

```js
{ name: 'about', content: 'This is content' }
```

#### string | string | object

1. Non-filepath key will be added to the `name` property
1. Must be `content`
1. Must be a [locals object]

**Examples:**

```js
loader.load('about', 'This is content', { title: 'Blog' });
```

Results in:

```js
{ name: 'about', content: 'This is content', locals: { title: 'Blog' }}
```


#### string | string | object | object

1. Non-filepath key will be added to the `name` property
1. Must be `content`
1. Must be a [locals object]
1. Must be an [options object]

**Examples:**

```js
loader.load('about', 'This is content', { title: 'Blog' }, { foo: true });
```

Results in:

```js
{
  name: 'about',
  content: 'This is content',
  locals: { title: 'Blog' },
  options: { foo: true }
}
```


### string / object

#### string | object

1. First arg is a non-filepath `key`, or
1. Second arg must be a [template object]

**Examples:**

```js
loader.load('about', { content: 'This is content.' });
loader.load('about', { content: 'This is content.', title: 'Blog' });
loader.load('about', { content: 'This is content.', locals: { title: 'Blog' }});
```

All result in:

```js
{
  name: 'about',
  content: 'This is content',
  locals: { title: 'Blog' }
}
```

#### string | object | object

1. First arg is a non-filepath `key`, or
1. Second arg must be a [template object]
1. Third arg must be an `options` object

**Examples:**

```js
loader.load('about', { content: 'This is content.', title: 'Blog' }, { foo: true }});
loader.load('about', { content: 'This is content.', title: 'Blog', options: { foo: true }});
loader.load('about', { content: 'This is content.', locals: { title: 'Blog' }}, { foo: true });
loader.load('about', { content: 'This is content.', locals: { title: 'Blog' }, options: { foo: true }});
```

All of the examples result in:

```js
{
  name: 'about',
  content: 'This is content',
  locals: { title: 'Blog' },
  options: { foo: true }
}
```


### object

> First arg is an object


#### object


#### object | object


**Examples:**

```js
loader.load({ name: 'about', content: 'This is content.' , title: 'Blog' });
loader.load({ name: 'about', content: 'This is content.' }, { title: 'Blog' });
loader.load({ name: 'about', content: 'This is content.' }, { title: 'Blog' });
loader.load({ name: 'about', content: 'This is content.', title: 'Blog' }, { foo: true });
loader.load({ name: 'about', content: 'This is content.', title: 'Blog' }, { foo: true });
loader.load({ name: 'about', content: 'This is content.', title: 'Blog', options: { foo: true }});
loader.load({ name: 'about', content: 'This is content.', locals: { title: 'Blog' }}, { foo: true });
loader.load({ name: 'about', content: 'This is content.', locals: { title: 'Blog' }, options: { foo: true }});
```

All of the examples result in:

```js
{
  name: 'about',
  content: 'This is content',
  locals: { title: 'Blog' },
  options: { foo: true }
}
```

#### object | object | object


### filepath or glob

> First arg is a file path or glob pattern.


#### string/array

1. First arg [will be parsed](#parsing-templates) as a file path or glob pattern.

**Examples:**

```js
loader.load('about.md');
loader.load('templates/*.hbs');
loader.load(['templates/*.hbs', 'content/*.md']);
```

#### string/array | object

1. First arg [will be parsed](#parsing-templates) as a file path or glob pattern.
1. Must be a [locals object]

**Examples:**

```js
loader.load('about.md', { title: 'Blog' });
loader.load('templates/*.hbs', { title: 'Blog' });
loader.load(['templates/*.hbs', 'content/*.md'], { title: 'Blog' });
```

#### string/array | object | object

1. First arg [will be parsed](#parsing-templates) as a file path or glob pattern.
1. Must be a [locals object].
1. Must be an [options object].

**Examples:**

```js
loader.load('about.md', { title: 'Blog' }, { foo: true });
loader.load('templates/*.hbs', { title: 'Blog' }, { foo: true });
loader.load(['templates/*.hbs', 'content/*.md'], { title: 'Blog' }, { foo: true });
```


### Parsing templates

When the first arg is a file path or glob pattern, this is how template objects are created:

1. Glob patterns are expanded
1. Each file is read with `fs.readFileSync()`
1. Each file is parsed with [gray-matter]
1. A normalized [template object] is returned with these additional properties from [gray-matter]:
   - `data`: An object of data from [front-matter], or empty if none exists.
   - `orig`: The original un-parsed file string.
   - `path`: The the fully-resolved path of each file.



[front-matter]: https://github.com/jonschlinkert/gray-matter