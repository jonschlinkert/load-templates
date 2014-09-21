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
