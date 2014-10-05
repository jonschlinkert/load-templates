


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
template.normalize('a/b/c.md');
template.normalize('a/b/c.md', 'this is content');
template.normalize('a/b/c.md', {content: 'this is content'});
template.normalize('a/b/c.md', {path: 'a/b/c.md'});
template.normalize('a/b/c.md', {path: 'a/b/c.md', content: 'this is content'});
template.normalize('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b'});
template.normalize('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b'}, {c: 'd'});
template.normalize('a/b/c.md', {path: 'a/b/c.md'}, {a: 'b', options: {c: 'd'}});
template.normalize('a/b/c.md', {path: 'a/b/c.md', locals: {a: 'b'}, options: {c: 'd'}});
```