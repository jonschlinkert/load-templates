var slice = require('array-slice');


function typeOf(val) {
  return {}.toString.call(val).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
}


/**
 * Return the index of the first value in the `array`
 * with the given native `type`.
 *
 * @param  {*} `type`
 * @param  {Number} `arr`
 * @return {Number} Index of the first value with a matching `type`.
 */

function firstIndexOfType(type, arr) {
  var len = arr.length >>> 0;
  var val = null;

  for (var i = 0; i < len; i++) {
    if (typeOf(arr[i]) === type) {
      return i;
    }
  }
  return val;
}


/**
 * Return the index of the first value in the `array`
 * with the given native `type`.
 *
 * @param  {*} `type`
 * @param  {Number} `arr`
 * @return {Number} Index of the first value with a matching `type`.
 */

function firstOfType(type, arr) {
  var len = arr.length >>> 0;
  var val = null;

  for (var i = 0; i < len; i++) {
    if (typeOf(arr[i]) === type) {
      val = arr[i];
      break;
    }
  }
  return val;
}


function lengthOfType(type, arr) {
  var first = firstIndexOfType('object', arr);
  var diff = arr.length - first;
  return (diff < 0) ? 0 : diff;
}

function fnArity(fn) {
  return fn.length;
}

function arityDiff(fn, args) {
  if (!args) {
    return fn.length;
  }
  return (fn.length - args.length);
}


function lengthOfType(num) {
  var args = [].slice.call(arguments);

  var first = firstIndexOfType('object', args);
  var arr = slice(args, first, args.length);
  console.log(arr);

  switch (num) {
  case 1:
    return detectArgs(1, args);
  case 2:
    return detectArgs(2, args);
  case 3:
    return detectArgs(3, args);
  case 4:
    return detectArgs(4, args);
  default:
    return null;
  }
};
