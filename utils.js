'use strict';

const File = require('vinyl');
const typeOf = require('kind-of');

/**
 * Set the `file.key` used for caching views
 */

exports.renameKey = function(file, options) {
  if (options && typeof options.renameKey === 'function') {
    return options.renameKey(file);
  }
  return file.key || file.path;
};

/**
 * Normalize the content/contents properties before passing
 * to syncContents, to ensure the initial value is correct
 */

exports.normalizeContent = function(view) {
  if (typeof view.content === 'string') {
    view.contents = new Buffer(view.content);

  } else if (typeOf(view.contents) === 'buffer') {
    view.content = view.contents.toString();
  }
  return view;
};

/**
 * Cast val to an array
 */

exports.arrayify = function(val) {
  return Array.isArray(val) ? val : [val];
};
