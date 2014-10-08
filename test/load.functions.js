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

describe(chalk.magenta('functions'), function () {
  beforeEach(function () {
    loader = new Loader();
  });

  describe(heading('[ function ]'), function () {
    describe(subhead('valid filepath:'), function () {
      it('should load templates from a function:', function () {
        var files = loader.load(function (options) {
          var file = matter.read('test/fixtures/a.md');
          var o = {};
          o[file.path] = file;
          return o;
        });
        files['test/fixtures/a.md'].should.have.properties(['ext', 'data', 'path', 'content']);
        files['test/fixtures/a.md'].should.have.property('ext', '.md');
        files['test/fixtures/a.md'].should.have.property('data', {title: 'AAA'});
        files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
      });

      it('should load templates from a function:', function () {

        var files = loader.load(function (options) {
          var file = matter.read('test/fixtures/a.md');
          var o = {};
          o[file.path] = file;
          return o;
        });
        files['test/fixtures/a.md'].should.have.properties(['ext', 'data', 'path', 'content']);
        files['test/fixtures/a.md'].should.have.property('ext', '.md');
        files['test/fixtures/a.md'].should.have.property('data', {title: 'AAA'});
        files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
      });
    });
  });
});
