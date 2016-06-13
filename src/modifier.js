// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// `Modifier` is an abstract interface for notational elements that modify
// a `Note`. Examples of modifiers are `Accidental`, `Annotation`, `Stroke`, etc.
//
// For a `Modifier` instance to be positioned correctly, it must be part of
// a `ModifierContext`. All modifiers in the same context are rendered relative to
// one another.
//
// Typically, all modifiers to a note are part of the same `ModifierContext` instance. Also,
// in multi-voice staves, all modifiers to notes on the same `tick` are part of the same
// `ModifierContext`. This ensures that multiple voices don't trample all over each other.

Vex.Flow.Modifier = (function() {
  function Modifier() {
    this.constructor = Modifier;
    this.init();
  }
  Modifier.CATEGORY = "none";

    // To enable logging for this class. Set `Vex.Flow.Modifier.DEBUG` to `true`.
  function L() { if (Modifier.DEBUG) Vex.L("Vex.Flow.Modifier", arguments); }

  // Modifiers can be positioned almost anywhere, relative to a note.
  Modifier.Position = {
    LEFT: 1,
    RIGHT: 2,
    ABOVE: 3,
    BELOW: 4
  };

  // ## Prototype Methods
  Modifier.prototype = {

    // The constructor sets initial widths and constants.
    init: function() {
      this.width = 0;
      this.context = null;

      // Modifiers are attached to a note and an index. An index is a
      // specific head in a chord.
      this.note = null;
      this.index = null;

      // The `text_line` is reserved space above or below a stave.
      this.text_line = 0;
      this.position = Modifier.Position.LEFT;
      this.modifier_context = null;
      this.x_shift = 0;
      this.y_shift = 0;
      this.spacingFromNextModifier = 0;
      L("Created new modifier");
    },

    // Every modifier has a category. The `ModifierContext` uses this to determine
    // the type and order of the modifiers.
    getCategory: function() { return this.constructor.CATEGORY; },

    // Get and set modifier widths.
    getWidth: function() { return this.width; },
    setWidth: function(width) { this.width = width; return this; },

    // Get and set attached note (`StaveNote`, `TabNote`, etc.)
    getNote: function() { return this.note; },
    setNote: function(note) { this.note = note; return this; },

    // Get and set note index, which is a specific note in a chord.
    getIndex: function() { return this.index; },
    setIndex: function(index) { this.index = index; return this; },

    // Get and set rendering context.
    getContext: function() { return this.context; },
    setContext: function(context) { this.context = context; return this; },

    // Every modifier must be part of a `ModifierContext`.
    getModifierContext: function() { return this.modifier_context; },
    setModifierContext: function(c) { this.modifier_context = c; return this; },

    // Get and set articulation position.
    getPosition: function() { return this.position; },
    setPosition: function(position) { this.position = position; return this; },

    // Set the `text_line` for the modifier.
    setTextLine: function(line) { this.text_line = line; return this; },

    // Shift modifier down `y` pixels. Negative values shift up.
    setYShift: function(y) { this.y_shift = y; return this; },

    setSpacingFromNextModifier: function(x) {
      this.spacingFromNextModifier = x;
    },

    getSpacingFromNextModifier: function() {return this.spacingFromNextModifier; },

    // Shift modifier `x` pixels in the direction of the modifier. Negative values
    // shift reverse.
    setXShift: function(x) {
      this.x_shift = 0;
      if (this.position == Modifier.Position.LEFT) {
        this.x_shift -= x;
      } else {
        this.x_shift += x;
      }
    },
    getXShift: function() {return this.x_shift;},

    // Render the modifier onto the canvas.
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      throw new Vex.RERR("MethodNotImplemented",
          "Draw() not implemented for this modifier.");
    }
  };

  return Modifier;
}());
