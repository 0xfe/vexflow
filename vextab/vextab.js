/**
 * VexTab Parser - A recursive descent parser for the VexTab language.
 * Copyright Mohit Cheppudira 2010 <mohit@muthanna.com>
 *
 * Requires the VexFlow rendering API - vexflow.js from:
 *
 *   http://vexflow.com
 *
 * Learn all about the VexTab language at:
 *
 *   http://vexflow.com/tabdiv/tutorial.html
 *
 * This file is licensed under the MIT license:
 *
 *   http://www.opensource.org/licenses/mit-license.php
 */

Vex.Flow.VexTab = function() {
  this.init();
}

Vex.Flow.VexTab.parseError = function(message, hash) {
    throw new Vex.RERR("ParseError", message);
}

/**
 * Initialize VexTab.
 * @constructor
 */
Vex.Flow.VexTab.prototype.init = function() {
  // The VexFlow elements generated from the VexTab code.
  this.elements = {
    staves: [],
    tabnotes: [],
    notes: [],
    ties: [],
    beams: []
  };

  this.valid = false;
  this.height = 0;            // Total height of generated elements.
  this.tuning = new Vex.Flow.Tuning(); // Defaults to standard tuning.
  vextab_parser.parseError = Vex.Flow.VexTab.parseError;
}

/**
 * Returns true if the passed-in code parsed without errors.
 *
 * @return {Boolean} True if code is error-free.
 */
Vex.Flow.VexTab.prototype.isValid = function() { return this.valid; }

/**
 * Returns the generated VexFlow elements. Remember to call #isValid before
 * calling this method.
 *
 * @return {!Object} The generated VexFlow elements.
 */
Vex.Flow.VexTab.prototype.getElements = function() {
  return this.elements;
}

/**
 * @return {Number} The total height (in pixels) of the generated elements.
 */
Vex.Flow.VexTab.prototype.getHeight = function() { return this.height; }

/**
 * This method parses the VexTab code provided, and generates VexFlow
 * elements from it. The elements can be retrieved with the #getElements
 * method.
 *
 * If the parse fails, a Vex.RuntimeError of the type "ParseError" is
 * thrown with the line number and specific error message.
 *
 * Upon success, no exception is thrown and #isValid returns true.
 *
 * @param {String} code The VexTab code to parse.
 */
Vex.Flow.VexTab.prototype.parse = function(code) {
  // Clear elements and initialize parse state
  this.init();
  return vextab_parser.parse(code);
}
