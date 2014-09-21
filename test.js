/*!
 * template-loader <https://github.com/jonschlinkert/template-loader>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';


var should = require('should');
var assert = require('assert');
var template = require('./');


describe('normalize templates', function () {
  describe('path and content properties', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.'}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize({path: 'a/b/c.md', content: 'this is content.'});
      actual.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var actual = template.normalize({ 'a/b/c.md': { content: 'this is content.'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.'});
      actual.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var actual = template.normalize('a/b/c.md', 'this is content.');
        actual.should.eql(expected);
      });
    });
  });


  describe('multiple templates:', function () {
    describe('objects:', function () {
      it('should use `path` and/or `content` properties as indicators:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.'},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.'},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'}
        };

        var actual = template.normalize({
          'a/b/a.md': {content: 'this is content.'},
          'a/b/b.md': {content: 'this is content.'},
          'a/b/c.md': {content: 'this is content.'}
        });
        actual.should.eql(expected);
      });

      it('should normalize locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.', locals: {a: {b: 'c'}}},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'}
        };

        var actual = template.normalize({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        });
        actual.should.eql(expected);
      });

      it('should normalize "method" locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.', locals: {a: {b: 'c'}, foo: 'bar'}},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.', locals: {a: {c: 'd'}, foo: 'bar'}},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.', locals: {foo: 'bar'}}
        };

        var actual = template.normalize({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        }, {foo: 'bar'});

        actual.should.eql(expected);
      });

      it('should normalize "method" locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.', locals: {a: {b: 'c'}, bar: 'bar'}},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.', locals: {a: {c: 'd'}, bar: 'bar'}},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.', locals: {bar: 'baz'}}
        };

        var actual = template.normalize({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}, bar: 'bar'},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}, bar: 'bar'}},
          'a/b/c.md': {content: 'this is content.'}
        }, {bar: 'baz'});

        actual.should.eql(expected);
      });
    });
  });


  describe('locals', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize({path: 'a/b/c.md', content: 'this is content.', a: 'b'});
      actual.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var actual = template.normalize({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}}});
      actual.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var actual = template.normalize({ 'a/b/c.md': { content: 'this is content.', a: 'b'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', a: 'b'});
      actual.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var actual = template.normalize('a/b/c.md', 'this is content.', {a: 'b'});
        actual.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var actual = template.normalize('a/b/c.md', 'this is content.', {locals: {a: 'b'}});
        actual.should.eql(expected);
      });
    });
  });

  describe('options', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize({path: 'a/b/c.md', content: 'this is content.', a: 'b', options: {y: 'z'}});
      actual.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var actual = template.normalize({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}});
      actual.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var actual = template.normalize({ 'a/b/c.md': { content: 'this is content.', a: 'b', options: {y: 'z'}}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', a: 'b'}, {y: 'z'});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', a: 'b'}, {options: {y: 'z'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', a: 'b'}, {options: {y: 'z'}});
      actual.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var actual = template.normalize('a/b/c.md', {content: 'this is content.', a: 'b', options: {y: 'z'}});
      actual.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var actual = template.normalize('a/b/c.md', 'this is content.', {a: 'b'}, {options: {y: 'z'}});
        actual.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var actual = template.normalize('a/b/c.md', 'this is content.', {a: 'b', options: {y: 'z'}});
        actual.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var actual = template.normalize('a/b/c.md', 'this is content.', {locals: {a: 'b'}, options: {y: 'z'}});
        actual.should.eql(expected);
      });
    });
  });
});

describe('glob patterns', function () {
  describe('arrays', function () {
    var expected = {
      'test/fixtures/a.txt': {
        data: { title: 'AAA' },
        content: 'This is from a.txt.',
        orig: '---\ntitle: AAA\n---\nThis is from a.txt.',
        path: 'test/fixtures/a.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/b.txt': {
        data: { title: 'BBB' },
        content: 'This is from b.txt.',
        orig: '---\ntitle: BBB\n---\nThis is from b.txt.',
        path: 'test/fixtures/b.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/c.txt': {
        data: { title: 'CCC' },
        content: 'This is from c.txt.',
        orig: '---\ntitle: CCC\n---\nThis is from c.txt.',
        path: 'test/fixtures/c.txt',
        locals: {a: 'b'},
        options: {foo: true}
      }
    };

    it('should read a glob of files and return an object of templates.', function () {
      template.normalize(['test/fixtures/*.txt'], {a: 'b'}, {foo: true}).should.eql(expected);
    });

    it('should read a glob of files and return an object of templates.', function () {
      template.normalize(['test/fixtures/*.txt'], {a: 'b', options: {foo: true}}).should.eql(expected);
    });
  });

  describe('strings', function () {
    var expected = {
      'test/fixtures/a.txt': {
        data: { title: 'AAA' },
        content: 'This is from a.txt.',
        orig: '---\ntitle: AAA\n---\nThis is from a.txt.',
        path: 'test/fixtures/a.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/b.txt': {
        data: { title: 'BBB' },
        content: 'This is from b.txt.',
        orig: '---\ntitle: BBB\n---\nThis is from b.txt.',
        path: 'test/fixtures/b.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/c.txt': {
        data: { title: 'CCC' },
        content: 'This is from c.txt.',
        orig: '---\ntitle: CCC\n---\nThis is from c.txt.',
        path: 'test/fixtures/c.txt',
        locals: {a: 'b'},
        options: {foo: true}
      }
    };

    it('should read a glob of files and return an object of templates.', function () {
      template.normalize('test/fixtures/*.txt', {a: 'b'}, {foo: true}).should.eql(expected);
    });
  });
});

describe('random', function () {
  it('should normalize a template with a non-filepath key.', function () {
    var actual = template.normalize('foo', {content: 'this is content.'});
    actual.should.eql({'foo': {path: 'foo', content: 'this is content.'}});
  });

  it('should normalize a template with a non-filepath key.', function () {
    var actual = template.normalize('foo', {content: 'this is content.', a: 'b'}, {fez: 'foo'});
    actual.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b'}, options: {fez: 'foo'}}});
  });

  it('should normalize a template with a non-filepath key.', function () {
    var actual = template.normalize({'foo': {content: 'this is content.', a: 'b'}}, {fez: 'foo'});
    actual.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b', fez: 'foo'}}});
  });

  it('should detect the key from an object with `path` and `content` properties', function () {
    var actual = template.normalize({path: 'a/b/c.md', content: 'this is content.', a: 'b', options: {y: 'z'}}, {c: 'd'}, {e: 'f'});
    actual.should.eql({'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b', c: 'd'}, options: {y: 'z', e: 'f'}}});
  });
});


// template.normalize({path: 'a/b/c.md', content: 'this is foo'}, {foo: 'bar'});
// template.normalize({'a/b/d.md': {content: 'this is bar'}}, {a: 'b'}, {foo: 'bar'});
// template.normalize('a/b/c.md', {content: 'this is baz', a: 'b'}, {foo: 'bar'});
// template.normalize('a/b/c.md', {content: 'this is baz', a: 'b', options: {foo: 'bar'}}, {foo: 'bar'});
// template.normalize('a/b/c.md', 'this is quux', {a: 'b'}, {foo: 'bar'});
// template.normalize({
//   'a/b/a.md': {content: 'this is content'},
//   'a/b/b.md': {content: 'this is content'},
//   'a/b/c.md': {content: 'this is content'}
// }, {a: 'b'}, {c: true});



// var foo = template.normalize({content: 'this is foo'});
// var foo = template.normalize({path: 'a/b/c.md'});

// 1st
// var foo = template.normalize({path: 'a/b/c.md', content: 'this is foo'}, {foo: 'bar'});

// 2nd arg is options
// in the inner obejct => forIn()
//   - if it has `content` or `path` it's a template
//   -
// var bar = template.normalize({
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'}
// }, {a: 'b'}, {foo: 'bar'});

// 3rd arg is options
// var baz = template.normalize('a/b/c.md', {content: 'this is baz', a: 'b'}, {foo: 'bar'});
// var baz = template.normalize('a/b/c.md', {content: 'this is baz', a: 'b', options: {foo: 'bar'}}, {foo: 'bar'});

// // 4th arg is options
// var quux = template.normalize('a/b/c.md', 'this is quux', {a: 'b'}, {foo: 'bar'});



// var o = {
//   path: 'a',
//   locals: {},
//   content: ''
// };

// var types = {
//   path: 'string',
//   locals: 'object',
//   content: 'string',
//   options: 'object'
// };

// var a = {
//   a: 'a',
//   b: 'b'
// };

// var b = {
//   c: 'c',
//   d: 'd'
// };

// console.log(hasTypes(o, types))
// console.log(extendProps(a, b, ['a', 'c', 'd']))



// var o = {
//   path: 'a',
//   foo: 'bar',
//   baz: 'quux',
//   locals: {a: 'b'},
//   content: 'this is content'
// };

// console.log(pick(o, ['path', 'content']))





