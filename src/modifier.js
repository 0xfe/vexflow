// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements varies types of modifiers to notes (e.g. bends,
// fingering positions etc.) Accidentals should also be implemented as
// modifiers, eventually.

/**
 * Create a new modifier for the specified note.
 *
 * @constructor
 */
Vex.Flow.Modifier = (function() {
  function Modifier() { this.init() }

  Modifier.Position = {
    LEFT: 1,
    RIGHT: 2,
    ABOVE: 3,
    BELOW: 4
  };

  Modifier.prototype = {
    init: function() {
      this.width = 0;
      this.context = null;
      this.note = null;
      this.index = null;
      this.text_line = 0;
      this.position = Modifier.Position.LEFT;
      this.modifier_context = null;
      this.x_shift = 0;
      this.y_shift = 0;
    },

    // Accessors
    getCategory: function() { return "none"; },
    getWidth: function() { return this.width; },
    setWidth: function(width) { this.width = width; return this; },
    getNote: function() { return this.note; },
    setNote: function(note) { this.note = note; return this; },
    getIndex: function() { return this.index; },
    setIndex: function(index) { this.index = index; return this; },
    getContext: function() { return this.context; },
    setContext: function(context) { this.context = context; return this; },
    getModifierContext: function() { return this.modifier_context; },
    setModifierContext: function(c) { this.modifier_context = c; return this; },
    setTextLine: function(line) { this.text_line = line; return this; },
    setYShift: function(y) { this.y_shift = y; return this; },

    // Shift x pixels in the direction of the modifier
    setXShift: function(x) {
      this.x_shift = 0;
      if (this.position == Modifier.Position.LEFT) {
        this.x_shift -= x;
      } else {
        this.x_shift += x;
      }
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      throw new Vex.RERR("MethodNotImplemented",
          "Draw() not implemented for this modifier.");
    }
  };

  return Modifier;
}());
