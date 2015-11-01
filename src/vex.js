// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements utility methods used by the rest of the VexFlow
// codebase.
//
// ## JSHint Settings
//
/* global window: false */
/* global document: false */

if (typeof Vex === 'undefined') {
  /* global Vex: true */
  Vex = function() {};
}

// Default log function sends all arguments to console.
Vex.L = function(block, args) {
  if (!args) return;
  var line = Array.prototype.slice.call(args).join(" ");
  window.console.log(block + ": " + line);
};

// Default runtime exception.
Vex.RuntimeError = function(code, message) {
  this.code = code;
  this.message = message;
};

Vex.RuntimeError.prototype.toString = function() {
  return "RuntimeError: " + this.message;
};

// Shortcut method for `RuntimeError`.
Vex.RERR = Vex.RuntimeError;

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
Vex.Merge = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

// DEPRECATED. Use `Math.*`.
Vex.Min = Math.min;
Vex.Max = Math.max;
Vex.forEach = function(a, fn) {
  for (var i=0; i<a.length; i++) {
    fn(a[i],i);
  }
};

// Round number to nearest fractional value (`.5`, `.25`, etc.)
Vex.RoundN = function(x, n) {
  return (x % n) >= (n/2) ?
    parseInt(x / n, 10) * n + n : parseInt(x / n, 10) * n;
};

// Locate the mid point between stave lines. Returns a fractional line if a space.
Vex.MidLine = function(a, b) {
  var mid_line = b + (a - b) / 2;
  if (mid_line % 2 > 0) {
    mid_line = Vex.RoundN(mid_line * 10, 5) / 10;
  }
  return mid_line;
};

// Take `arr` and return a new list consisting of the sorted, unique,
// contents of arr. Does not modify `arr`.
Vex.SortAndUnique = function(arr, cmp, eq) {
  if (arr.length > 1) {
    var newArr = [];
    var last;
    arr.sort(cmp);

    for (var i = 0; i < arr.length; ++i) {
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
Vex.Contains = function(a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
};

// Get the 2D Canvas context from DOM element `canvas_sel`.
Vex.getCanvasContext = function(canvas_sel) {
  if (!canvas_sel)
    throw new Vex.RERR("BadArgument", "Invalid canvas selector: " + canvas_sel);

  var canvas = document.getElementById(canvas_sel);
  if (!(canvas && canvas.getContext)) {
    throw new Vex.RERR("UnsupportedBrowserError",
        "This browser does not support HTML5 Canvas");
  }

  return canvas.getContext('2d');
};

// Draw a tiny dot marker on the specified canvas. A great debugging aid.
//
// `ctx`: Canvas context.
// `x`, `y`: Dot coordinates.
Vex.drawDot = function(ctx, x, y, color) {
  var c = color || "#f55";
  ctx.save();
  ctx.setFillStyle(c);

  //draw a circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds.
Vex.BM = function(s, f) {
  var start_time = new Date().getTime();
  f();
  var elapsed = new Date().getTime() - start_time;
  Vex.L(s + elapsed + "ms");
};

// Basic classical inheritance helper. Usage:
// ```
// // Vex.Inherit(Child, Parent, {
// //   getName: function() {return this.name;},
// //   setName: function(name) {this.name = name}
// // });
// //
// // Returns 'Child'.
// ```
Vex.Inherit = (function () {
  var F = function () {};
  // `C` is Child. `P` is parent. `O` is an object to
  // to extend `C` with.
  return function (C, P, O) {
    F.prototype = P.prototype;
    C.prototype = new F();
    C.superclass = P.prototype;
    C.prototype.constructor = C;
    Vex.Merge(C.prototype, O);
    return C;
  };
}());

// Get stack trace.
Vex.StackTrace = function() {
  var err = new Error();
  return err.stack;
};

// Dump warning to console.
Vex.W = function() {
  var line = Array.prototype.slice.call(arguments).join(" ");
  window.console.log("Warning: ", line, Vex.StackTrace());
};

// Used by various classes (e.g., SVGContext) to provide a
// unique prefix to element names (or other keys in shared namespaces).
Vex.Prefix = function(text) {
  return Vex.Prefix.prefix + text;
};
Vex.Prefix.prefix = "vf-";

// UMD to export Vex.
//
/* global require: false */
/* global define: false */
/* global module: false */
if (typeof require == "function") {
  try {
    module.exports = Vex;
  } catch (e) {}
} else if (typeof define == "function" && define.amd) {
  define("Vex", [], function(){ return Vex; });
} else {
  (this || window)["Vex"] = Vex;
}
