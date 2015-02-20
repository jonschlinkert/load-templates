/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
require('should');
var matter = require('gray-matter');
var utils = require('../lib/utils');
var Loader = require('..');
var loader = new Loader();

function heading(str) {
  return chalk.magenta(str) + chalk.bold(' pattern:');
}

function subhead(str) {
  return chalk.cyan(str);
}

describe(chalk.magenta('strings'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe(heading('json files'), function () {
    it('should load templates from json files.', function () {
      var files = loader.load(['test/fixtures/a.json']);
      files.should.eql({
        'test/fixtures/a.json': {
          path: 'test/fixtures/a.json',
          ext: '.json',
          content: 'this is the {{title}} page.',
          locals: { title: 'Home' },
          options: { foo: true }
        }
      });
    });

    it('should load templates from json files.', function () {
      var files = loader.load(['test/fixtures/b.json']);
      files.should.eql({
        'test/fixtures/b.json': {
          path: 'test/fixtures/b.json',
          ext: '.json',
          content: 'this is the {{title}} page.',
          locals: { title: 'BBB', whatever: 'AAA' },
          options: { bar: true }
        }
      });
    });
  });
});
