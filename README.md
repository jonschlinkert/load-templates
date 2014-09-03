# load-templates [![NPM version](https://badge.fury.io/js/load-templates.png)](http://badge.fury.io/js/load-templates)

> Load templates from file paths, globs or objects, and cache them as normalized objects.

This is a template loader, pure and simple, no rendering or caching.

Currently any of the following input configurations will return a normalized template object with the same root properties:

```js
loader.load(['abc/*.hbs']);
loader.load('abc/*.md');
loader.load({'abc/def.md': {content: 'ghi.', lmn: 'xyz'});
loader.load({'abc/def.md': {content: 'ghi.'}}, {lmn: 'xyz'});
loader.load({path: 'abc/def.md', content: 'ghi.'}, {lmn: 'xyz'});
loader.load({path: 'abc/def.md', content: 'ghi.', lmn: 'xyz'});
loader.load('abc.md', 'def <%= name %>.');
loader.load('abc.md', 'def <%= name %>.', {name: 'Jon Schlinkert'});
```

**Root properties**

* `path`: file path or key to use for the template.
* `data`: data from the parsed template, e.g. front-matter.
* `locals`: locals pass on one of the loader methods. (keeping locals and data seperate allows you to merge however you need to.)
* `content`: the parsed content of the template
* `orig`: the original content of the template, if parsed

Properties that are not on this list will be moved/copied to the `data` object and retained on `orig`.

## Install
#### Install with [npm](npmjs.org):

```bash
npm i load-templates --save-dev
```

## Run tests

```bash
npm test
```

## API
### [loader](index.js#L30)

* `options` **{Object}**: Options to initialize `loader` with    

```js
var loader = require('load-templates');
```

### [.load](index.js#L86)

Expand glob patterns, load, read, parse and normalize files from file paths, strings, objects, or arrays of these types.

* `key` **{String|Object|Array}**: Array, object, string or file paths.    
* `value` **{String|Object}**: String of content, `file` object with `content` property, or `locals` if the first arg is a file path.    
* `options` **{Object}**: Options or `locals`.    
* `returns` **{Object}**: Normalized file object.  

**Examples:**

Filepaths or arrays of glob patterns.

```js
var temlates = loader.load(['pages/*.hbs']);
var posts = loader.load('posts/*.md');
```

As strings or objects:

```js
// loader.load(key, value, locals);
var docs = loader.load({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});

// loader.load(key, value, locals);
var post = loader.load('abc.md', 'My name is <%= name %>.', {name: 'Jon Schlinkert'});
```

### [.string](index.js#L105)

* `key` **{String}**: Glob patterns or file paths.    
* `value` **{String|Object}**: String of content, `file` object with `content` property, or `locals` if the first arg is a file path.    
* `options` **{Object}**: Options or `locals`.    
* `returns` **{Object}**: Normalized file object.  

Expand glob patterns, load, read, parse and normalize files
from file paths or strings.

### [.array](index.js#L144)

* `patterns` **{Object}**: Glob patterns or array of filepaths.    
* `options` **{Object}**: Options or `locals`    
* `returns` **{Array}**: Array of normalized file objects.  

Normalize an array of patterns.

### [.object](index.js#L161)

* `file` **{Object}**: The object to normalize.    
* `options` **{Object}**: Options or `locals`    

Normalize a template object.

### [._cwd](index.js#L173)

* `filepath` **{String}**    

The current working directory to use. Default is `process.cwd()`.

### [.rename](index.js#L187)

* `filepath` **{String}**    

Rename the `key` of each template loaded using whatever rename function
is defined on the options. `path.basename` is the default.

### [.parse](index.js#L204)

* `filepath` **{String}**: The path of the file to read/parse.    
* `Options` **{Object}**: Options or `locals`.    

Parse the content of each template loaded using whatever parsing function
is defined on the options. `fs.readFileSync` is used by default.

### [.normalize](index.js#L233)

* `file` **{Object}**: The template object to normalize.    
* `Options` **{Object}**: Options or `locals`.    

Normalize a template using whatever normalize function is
defined on the options.

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on September 02, 2014._