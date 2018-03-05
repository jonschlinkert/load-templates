'use strict';

const util = require('util');
const path = require('path');
const inflection = require('inflection');
const define = require('define-property');
const utils = require('../utils');
const Loader = require('..');

/**
 * Example application using load-templates
 *
 * ```js
 * const Collections = require('engine');
 * const engine = new Collections();
 * ```
 *
 * @param {Object} options
 */

class Collections {
  constructor(options) {
    this.options = Object.assign({}, options);
    this.views = {};
    this.renameKey = this.options.renameKey || (file => file.relative);
    this.create('partial', 'partials');
    this.create('layout', 'layouts');
    this.create('page', 'pages');
  }

  /**
   * Load templates
   */

  load(...args) {
    const loader = new Loader(this.options);
    return loader.load(...args);
  }

  /**
   * Create a template collection.
   * @param  {String} `name` The name of the collection, e.g. `pages.
   * @return {String}
   */

  create(name) {
    const single = inflection.singularize(name);
    const plural = inflection.pluralize(name);
    this.views[plural] = {};

    function collection(key, value, locals, options) {
      const files = this.load(key, value, locals, options);
      for (const key of Object.keys(files)) {
        this.views[plural][this.renameKey(files[key])] = files[key];
      }
      return this;
    }

    define(this, plural, collection);
    define(this, single, collection);
    return this;
  }
}

/**
 * Create an instance of `Collections`
 */

const engine = new Collections();

/**
 * Load some templates
 */

engine.layout('test/fixtures/a.md', { a: 'b' });

engine.page('one.md', { content: '...' });
engine.page({ 'two.md': { content: '...' } });
engine.pages({
  'three.md': { content: '...' },
  'four.md': { content: '...', data: { layout: 'default' } },
  'five.md': '...',
  'six.md': '...'
});

engine.partial('button.hbs', { content: '<button> Click me! </button>' });

console.log(util.inspect(engine, null, 10));
