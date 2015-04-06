/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var Loader = require('..');
var loader = new Loader();

loader.option('cwd',  __dirname + '/fixtures');
loader.option('name', function (fp) {
  return path.basename(fp);
})

var f1 = require('./fixtures/templates');
var f2 = require('./fixtures/templates2');
var n = 0;
try {
  // convert templates from f1 to format of f2
  var res = {};
  f1.forEach(function (fixture, i) {
    n = i;
    res[i] = loader.load.apply(loader, fixture);
  });
} catch(err) {
  console.log(n, err)
}

// var str = JSON.stringify(res, null, 2)
var str = util.inspect(res, null, 10)
  .replace(/\n/g, '')
  .replace(/( +)/g, ' ')
  .replace(/(['"]\d+['"]:)/g, '\n  $1')
  .replace(/\}$/, '\n}')

fs.writeFileSync('test/actual/templates2.js', str);
