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

describe(chalk.magenta('strings'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe(heading('json files'), function () {
    it('should load templates from json files.', function () {
      var files = loader.load(['test/fixtures/*.json']);
      console.log(files)

    });
  });
});
