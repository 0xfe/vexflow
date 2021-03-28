// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements utility methods used by the rest of the VexFlow
// codebase.
//

/* eslint max-classes-per-file: "off" */

const Vex = () => {};

// Default log function sends all arguments to console.
Vex.L = (block, args) => {
  if (!args) return;
  const line = Array.prototype.slice.call(args).join(' ');
  window.console.log(block + ': ' + line);
};

Vex.MakeException = (name) => {
  const exception = class extends Error {
    constructor(message, data) {
      super(message);
      this.name = name;
      this.message = message;
      this.data = data;
    }
  };

  return exception;
};

// Default runtime exception.
class RuntimeError extends Error {
  constructor(code, message) {
    super('[RuntimeError] ' + code + ':' + message);
    this.code = code;
  }
}

// Shortcut method for `RuntimeError`.
Vex.RuntimeError = RuntimeError;
Vex.RERR = Vex.RuntimeError;

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
Vex.Merge = (destination, source) => {
  for (const property in source) {
    // eslint-disable-line guard-for-in
    destination[property] = source[property];
  }
  return destination;
};

// DEPRECATED. Use `Math.*`.
Vex.Min = Math.min;
Vex.Max = Math.max;
Vex.forEach = (a, fn) => {
  for (let i = 0; i < a.length; i++) {
    fn(a[i], i);
  }
};

// Round number to nearest fractional value (`.5`, `.25`, etc.)
Vex.RoundN = (x, n) => (x % n >= n / 2 ? parseInt(x / n, 10) * n + n : parseInt(x / n, 10) * n);

// Locate the mid point between stave lines. Returns a fractional line if a space.
Vex.MidLine = (a, b) => {
  let mid_line = b + (a - b) / 2;
  if (mid_line % 2 > 0) {
    mid_line = Vex.RoundN(mid_line * 10, 5) / 10;
  }
  return mid_line;
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
    throw new Vex.RERR('BadArgument', 'Invalid canvas selector: ' + canvas_sel);
  }

  const canvas = document.getElementById(canvas_sel);
  if (!(canvas && canvas.getContext)) {
    throw new Vex.RERR('UnsupportedBrowserError', 'This browser does not support HTML5 Canvas');
  }

  return canvas.getContext('2d');
};

// Draw a tiny dot marker on the specified canvas. A great debugging aid.
//
// `ctx`: Canvas context.
// `x`, `y`: Dot coordinates.
Vex.drawDot = (ctx, x, y, color = '#55') => {
  ctx.save();
  ctx.setFillStyle(color);

  // draw a circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds.
Vex.BM = (s, f) => {
  const start_time = new Date().getTime();
  f();
  const elapsed = new Date().getTime() - start_time;
  Vex.L(s + elapsed + 'ms');
};

// Get stack trace.
Vex.StackTrace = () => {
  const err = new Error();
  return err.stack;
};

// Dump warning to console.
Vex.W = (...args) => {
  const line = args.join(' ');
  window.console.log('Warning: ', line, Vex.StackTrace());
};

// Used by various classes (e.g., SVGContext) to provide a
// unique prefix to element names (or other keys in shared namespaces).
Vex.Prefix = (text) => Vex.Prefix.prefix + text;
Vex.Prefix.prefix = 'vf-';

export { Vex };
