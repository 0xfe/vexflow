// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements accidentals as modifiers that can be attached to
// notes. Support is included for both western and microtonal accidentals.
//
// See `tests/accidental_tests.js` for usage examples.

Vex.Flow.Accidental = (function(){
  function Accidental(type) {
    if (arguments.length > 0) this.init(type);
  }

  // To enable logging for this class. Set `Vex.Flow.Accidental.DEBUG` to `true`.
  function L() { if (Accidental.DEBUG) Vex.L("Vex.Flow.Accidental", arguments); }

  var Modifier = Vex.Flow.Modifier;

  // ## Prototype Methods
  //
  // An `Accidental` inherits from `Modifier`, and is formatted within a
  // `ModifierContext`.
  Vex.Inherit(Accidental, Modifier, {
    // Create accidental. `type` can be a value from the
    // `Vex.Flow.accidentalCodes.accidentals` table in `tables.js`. For
    // example: `#`, `##`, `b`, `n`, etc.
    init: function(type) {
      Accidental.superclass.init.call(this);
      L("New accidental: ", type);

      this.note = null;
      // The `index` points to a specific note in a chord.
      this.index = null;
      this.type = type;
      this.position = Modifier.Position.LEFT;

      this.render_options = {
        // Font size for glyphs
        font_scale: 38,

        // Length of stroke across heads above or below the stave.
        stroke_px: 3
      };

      this.accidental = Vex.Flow.accidentalCodes(this.type);
      if (!this.accidental) throw new Vex.RERR("ArgumentError", "Unknown accidental type: " + type);

      // Cautionary accidentals have parentheses around them
      this.cautionary = false;
      this.paren_left = null;
      this.paren_right = null;

      // Initial width is set from table.
      this.setWidth(this.accidental.width);
    },

    // Return the modifier type. Used by the `ModifierContext` to calculate
    // layout.
    getCategory: function() { return "accidentals"; },

    // Attach this accidental to `note`, which must be a `StaveNote`.
    setNote: function(note){
      if (!note) throw new Vex.RERR("ArgumentError", "Bad note value: " + note);
      this.note = note;

      // Accidentals attached to grace notes are rendered smaller.
      if (this.note.getCategory() === 'gracenotes') {
        this.render_options.font_scale = 25;
        this.setWidth(this.accidental.gracenote_width);
      }
    },

    // If called, draws parenthesis around accidental.
    setAsCautionary: function() {
      this.cautionary = true;
      this.render_options.font_scale = 28;
      this.paren_left = Vex.Flow.accidentalCodes("{");
      this.paren_right = Vex.Flow.accidentalCodes("}");
      var width_adjust = (this.type == "##" || this.type == "bb") ? 6 : 4;

      // Make sure `width` accomodates for parentheses.
      this.setWidth(this.paren_left.width + this.accidental.width + this.paren_right.width - width_adjust);
      return this;
    },

    // Render accidental onto canvas.
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw accidental without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw accidental without a note and index.");

      // Figure out the start `x` and `y` coordinates for this note and index.
      var start = this.note.getModifierStartXY(this.position, this.index);
      var acc_x = (start.x + this.x_shift) - this.width;
      var acc_y = start.y + this.y_shift;
      L("Rendering: ", this.type, acc_x, acc_y);

      if (!this.cautionary) {
        // Render the accidental alone.
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.accidental.code);
      } else {
        // Render the accidental in parentheses.
        acc_x += 3;
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.paren_left.code);
        acc_x += 2;
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.accidental.code);
        acc_x += this.accidental.width - 2;
        if (this.type == "##" || this.type == "bb") acc_x -= 2;
        Vex.Flow.renderGlyph(this.context, acc_x, acc_y,
                             this.render_options.font_scale, this.paren_right.code);
      }
    }
  });

  return Accidental;
}());