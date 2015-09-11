/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');
var cache = {};

module.exports = function (cache, fn) {
  if (typeof cache === 'function') {
    fn = cache;
    cache = undefined;
  }

  cache = cache || {};

  function loadViews(key, val, locals) {
    if (key == null) return {};

    if (utils.isView(val)) {
      return addView(key, val, locals);
    }

    if (!locals && !utils.isOptions(val)) {
      locals = val;
    }

    if (utils.isObject(key)) {
      return addViews(key, val, locals);
    }

    val = val || {};
    key = utils.arrayify(key);

    if (!utils.isGlob(key)) {
      return addViews(key, val, locals);
    }

    loader(key, val, locals);
    return cache;
  }

  function addView(name, view, locals) {
    if (locals) view.locals = locals;
    cache[name] = view;
    return cache;
  }

  function addViews(views, locals) {
    if (Array.isArray(views)) {
      views.forEach(function (view) {
        loadViews(view, locals);
      });
    } else {
      for (var name in views) {
        addView(name, views[name], locals);
      }
    }
    return cache;
  }

  function loader(patterns, opts, locals) {
    var files = utils.glob.sync(patterns, opts);
    var len = files.length, i = -1;
    while (++i < len) {
      var name = files[i];
      var stat = utils.tryStat(name, opts);
      if (stat && stat.isFile()) {
        var file = utils.getProps(opts);
        file.stat = stat;
        file.path = opts.cwd ? path.join(opts.cwd, name) : name;
        file.key = utils.renameKey(file.path, opts);
        if (typeof fn === 'function') {
          file = fn(file, locals);
        }
        loadViews(file.key, file, locals);
      }
    }
    return cache;
  }

  return loadViews;
};
