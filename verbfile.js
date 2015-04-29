'use strict';
/* deps:mocha */
var verb = require('verb');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

verb.task('default', function(cb) {
  verb.src(['index.js', 'lib/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      verb.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          reporters: [ 'text' ],
          reportOpts: {dir: 'coverage', file: 'summary.txt'}
        }))
        .on('end', cb);
    });
});
