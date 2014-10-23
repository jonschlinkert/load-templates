/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var should = require('should');
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

describe(chalk.magenta('vinyl files'), function () {
  beforeEach(function () {
    loader = new Loader({vinyl: true});
  });

  it('should load templates as vinyl files:', function () {
    var files = loader.load('test/fixtures/a.md');
    files['test/fixtures/a.md'].should.have.properties(['contents', '_contents', 'stat']);
  });

  it('should have a `contents` property that is a buffer:', function () {
    var files = loader.load('test/fixtures/a.md');
    files['test/fixtures/a.md'].contents.should.be.an.instanceof(Buffer);
  });
});
