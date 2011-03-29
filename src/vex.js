// Vex Base Libraries.
// Mohit Muthanna Cheppudira <mohit@muthanna.com>
//
// Copyright Mohit Muthanna Cheppudira 2010

/** @constructor */
function Vex() {}

/**
 * Enable debug mode for special-case code.
 *
 * @define {boolean}
 */
Vex.Debug = true;

/**
 * Logging levels available to this application.
 * @enum {number}
 */
Vex.LogLevels = {
  DEBUG: 5,
  INFO: 4,
  WARN: 3,
  ERROR: 2,
  FATAL: 1
}

/**
 * Set the debuglevel for this application.
 *
 * @define {number}
 */
Vex.LogLevel = 5;

/**
 * Logs a message to the console.
 *
 * @param {Vex.LogLevels} level A logging level.
 * @param {string|number|!Object} A log message (or object to dump).
 */
Vex.LogMessage = function(level, message) {
  if ((level <= Vex.LogLevel) && window.console) {
    var log_message = message;

    if (typeof(message) == 'object') {
      log_message = {
        level: level,
        message: message
      };
    } else {
      log_message = "VexLog: [" + level + "] " + log_message;
    }

    window.console.log(log_message);
  }
};

/**
 * Logging shortcuts.
 */
Vex.LogDebug = function(message) {
  Vex.LogMessage(Vex.LogLevels.DEBUG, message); }
Vex.LogInfo = function(message) {
  Vex.LogMessage(Vex.LogLevels.INFO, message); }
Vex.LogWarn = function(message) {
  Vex.LogMessage(Vex.LogLevels.WARN, message); }
Vex.LogError = function(message) {
  Vex.LogMessage(Vex.LogLevels.ERROR, message); }
Vex.LogFatal = function(message, exception) {
  Vex.LogMessage(Vex.LogLevels.FATAL, message);
  if (exception) throw exception; else throw "VexFatalError";
}
Vex.Log = Vex.LogDebug;
Vex.L = Vex.LogDebug;

/**
 * Simple assertion checks.
 */

/**
 * An exception for assertions.
 *
 * @constructor
 * @param {string} message The message to display.
 */
Vex.AssertException = function(message) { this.message = message; }
Vex.AssertException.prototype.toString = function() {
  return "AssertException: " + this.message;
}
Vex.Assert = function(exp, message) {
  if (Vex.Debug && !exp) {
    if (!message) message = "Assertion failed.";
    throw new Vex.AssertException(message);
  }
}

/**
 * An generic runtime exception. For example:
 *
 *    throw new Vex.RuntimeError("BadNoteError", "Bad note: " + note);
 *
 * @constructor
 * @param {string} message The exception message.
 */
Vex.RuntimeError = function(code, message) {
  this.code = code;
  this.message = message;
}
Vex.RuntimeError.prototype.toString = function() {
  return "RuntimeError: " + this.message;
}

Vex.RERR = Vex.RuntimeError;

/**
 * Merge "destination" hash with "source" hash, overwriting like keys
 * in "source" if necessary.
 */
Vex.Merge = function(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
};

/**
 * Min / Max: If you don't know what this does, you should be ashamed of yourself.
 */
Vex.Min = function(a, b) {
  return (a > b) ? b : a;
};

Vex.Max = function(a, b) {
  return (a > b) ? a : b;
};

/**
 * Take 'arr' and return a new list consisting of the sorted, unique,
 * contents of arr.
 */
Vex.SortAndUnique = function(arr, cmp) {
  if (arr.length > 1) {
    var newArr = [];
    var last_tick;
    arr.sort(cmp);
    for (var i = 0; i < arr.length; ++i) {
      if (i == 0 || arr[i] != last_tick) {
        newArr.push(arr[i]);
      }
      last_tick = arr[i];
    }

    return newArr;
  } else {
    return arr;
  }
}

/**
 * Check if array "a" contains "obj"
 */
Vex.Contains = function(a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

/**
 * @param {string} canvas_sel The selector id for the canvas.
 * @return {!Object} A 2D canvas context.
 */
Vex.getCanvasContext = function(canvas_sel) {
  if (!canvas_sel)
    throw new Vex.RERR("BadArgument", "Invalid canvas selector: " + canvas_sel);

  var canvas = document.getElementById(canvas_sel);
  if (!(canvas && canvas.getContext)) {
    throw new Vex.RERR("UnsupportedBrowserError",
        "This browser does not support HTML5 Canvas");
  }

  return canvas.getContext('2d');
}

/**
 * Draw a tiny marker on the specified canvas. A great debugging aid.
 *
 * @param {!Object} ctx Canvas context.
 * @param {number} x X position for dot.
 * @param {number} y Y position for dot.
 */
Vex.drawDot = function(ctx, x, y, color) {
  var c = color || "#f55";
  ctx.save();
  ctx.fillStyle = c;

  //draw a circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

Vex.BM = function(s, f) {
  var start_time = new Date().getTime();
  f();
  var elapsed = new Date().getTime() - start_time;
  Vex.L(s + elapsed + "ms");
}
