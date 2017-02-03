/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var File = require('vinyl');
var glob = require('matched');
var extend = require('extend-shallow');
var utils = require('./utils');

function Loader(options) {
  if (!(this instanceof Loader)) {
    return new Loader(options);
  }
  this.options = extend({}, options);
  this.cache = this.options.cache || {};
}

Loader.prototype.createView = function(file, options) {
  var opts = utils.extend({cwd: process.cwd()}, this.options, options);
  var view;

  if (utils.isObject(file)) {
    view = new File(file);
  } else {
    view = new File({path: path.resolve(opts.cwd, file)});
  }

  view.base = opts.base || path.resolve(opts.cwd, opts.parent || '');
  view.cwd = opts.cwd;
  view.options = {};
  view.locals = {};
  view.data = {};

  view.key = utils.renameKey(view, opts);
  utils.contents.sync(view, opts);

  if (typeof this.options.loaderFn === 'function') {
    view = this.options.loaderFn(view) || view;
  }

  return view;
};

Loader.prototype.addView = function(file, options) {
  var view = this.createView(file, options);
  this.cache[view.key] = view;
  return this;
};

Loader.prototype.addViews = function(views, options) {
  if (typeof views === 'string' && utils.isView(options)) {
    let view = options;
    let key = views;
    view.path = view.path || key;
    view.key = key;
    return this.addView(view);
  }

  if (Array.isArray(views)) {
    for (let i = 0; i < views.length; i++) {
      this.addView(views[i], options);
    }

  } else if (utils.isObject(views)) {
    for (let key in views) {
      let view = views[key];

      if (views.hasOwnProperty(key)) {
        if (utils.isView(view)) {
          view.path = view.path || key;
          view.key = key;

        } else if (typeof view === 'string') {
          view = { content: view, path: key };
        }
      }

      this.addView(view, options);
    }
  }
  return this;
};

Loader.prototype.globViews = function(patterns, options) {
  let opts = extend({cwd: process.cwd()}, this.options, options);
  // don't support nonull, it doesn't make sense here
  delete opts.nonull;

  opts.cwd = path.resolve(opts.cwd);
  patterns = utils.arrayify(patterns);
  let len = patterns.length;
  let idx = -1;

  // iterate over all patterns, so we can get the actual glob parent
  while (++idx < len) {
    let pattern = patterns[idx];
    let isGlob = utils.isGlob(pattern);
    let files = isGlob ? glob.sync(pattern, opts) : [pattern];
    if (!files.length) continue;

    // get the glob parent to use as `file.base`
    let parent = isGlob ? utils.parent(pattern) : '';

    // create a view
    this.addViews(files, extend({}, opts, {parent: parent}));
  }
  return this;
};

Loader.prototype.load = function(views, options) {
  switch (utils.typeOf(views)) {
    case 'object':
      return this.addViews(views, options);
    case 'array':
      for (var i = 0; i < views.length; i++) {
        this.load(views[i], options);
      }
      break;
    case 'string':
    default: {
      if (utils.isView(options)) {
        return this.addViews(views, options);
      }
      return this.globViews(views, options);
    }
  }
  return this;
};

module.exports = Loader;
