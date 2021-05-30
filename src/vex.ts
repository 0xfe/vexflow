// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements utility methods used by the rest of the VexFlow
// codebase.
//

/* eslint max-classes-per-file: "off" */
import { RuntimeError, log } from './util';

const Vex = () => {};

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
Vex.Merge = (destination, source) => {
  for (const property in source) {
    // eslint-disable-line guard-for-in
    destination[property] = source[property];
  }
  return destination;
};

Vex.forEach = (a, fn) => {
  for (let i = 0; i < a.length; i++) {
    fn(a[i], i);
  }
};

// Take `arr` and return a new list consisting of the sorted, unique,
// contents of arr. Does not modify `arr`.
Vex.SortAndUnique = (arr, cmp, eq) => {
  if (arr.length > 1) {
    const newArr = [];
    let last;
    arr.sort(cmp);

    for (let i = 0; i < arr.length; ++i) {
      if (i === 0 || !eq(arr[i], last)) {
        newArr.push(arr[i]);
      }
      last = arr[i];
    }

    return newArr;
  } else {
    return arr;
  }
};

// Check if array `a` contains `obj`.
Vex.Contains = (a, obj) => {
  let i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
};

// Get the 2D Canvas context from DOM element `canvas_sel`.
Vex.getCanvasContext = (canvas_sel) => {
  if (!canvas_sel) {
    throw new RuntimeError('BadArgument', 'Invalid canvas selector: ' + canvas_sel);
  }

  const canvas = document.getElementById(canvas_sel);
  if (!(canvas && canvas.getContext)) {
    throw new RuntimeError('UnsupportedBrowserError', 'This browser does not support HTML5 Canvas');
  }

  return canvas.getContext('2d');
};

// Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds.
Vex.BM = (s, f) => {
  const start_time = new Date().getTime();
  f();
  const elapsed = new Date().getTime() - start_time;
  log(s + elapsed + 'ms');
};

export { Vex };
