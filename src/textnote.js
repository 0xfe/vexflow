// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2013

/** @constructor */
Vex.Flow.TextNote = (function() {
  function TextNote(text_struct) {
    if (arguments.length > 0) this.init(text_struct);
  }

  TextNote.Justification = {
    LEFT: 1,
    CENTER: 2,
    RIGHT: 3
  };

  TextNote.GLYPHS = {
    "segno": {
      code: "v8c",
      point: 40,
      x_shift: 0,
      y_shift: -10
      // width: 10 // optional
    },
    "tr": {
      code: "v1f",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "mordent_upper": {
      code: "v1e",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "mordent_lower": {
      code: "v45",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "f": {
      code: "vba",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "p": {
      code: "vbf",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "m": {
      code: "v62",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "s": {
      code: "v4a",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "z": {
      code: "v80",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
    "coda": {
      code: "v4d",
      point: 40,
      x_shift: 0,
      y_shift: -8
      // width: 10 // optional
    },
    "pedal_open": {
      code: "v36",
      point:40,
      x_shift:0,
      y_shift:0
    },
    "pedal_close": {
      code: "v5d",
      point:40,
      x_shift:0,
      y_shift:3
    },
    "caesura_straight": {
      code: "v34",
      point:40,
      x_shift:0,
      y_shift:2
    },
    "caesura_curved": {
      code: "v4b",
      point:40,
      x_shift:0,
      y_shift:2
    },
    "breath": {
      code: "v6c",
      point:40,
      x_shift:0,
      y_shift:0
    },
    "tick": {
      code: "v6f",
      point:50,
      x_shift:0,
      y_shift:0
    },
    "turn": {
      code: "v72",
      point:40,
      x_shift:0,
      y_shift:0
    },
    "turn_inverted": {
      code: "v33",
      point:40,
      x_shift:0,
      y_shift:0
    },

    // DEPRECATED - please use "mordent_upper" or "mordent_lower"
    "mordent": {
      code: "v1e",
      point: 40,
      x_shift: 0,
      y_shift: 0
      // width: 10 // optional
    },
  };

  Vex.Inherit(TextNote, Vex.Flow.Note, {
    init: function(text_struct) {
      TextNote.superclass.init.call(this, text_struct);

      // Note properties
      this.text = text_struct.text;
      this.glyph_type = text_struct.glyph;
      this.glyph = null;
      this.font = {
        family: "Arial",
        size: 12,
        weight: ""
      };

      if (text_struct.font) this.font = text_struct.font;

      if (this.glyph_type) {
        var struct = TextNote.GLYPHS[this.glyph_type];
        if (!struct) throw new Vex.RERR("Invalid glyph type: " + this.glyph_type);

        this.glyph = new Vex.Flow.Glyph(struct.code, struct.point, {cache: false});

        if (struct.width)
          this.setWidth(struct.width);
        else
          this.setWidth(this.glyph.getMetrics().width);

        this.glyph_struct = struct;
      } else {
        this.setWidth(Vex.Flow.textWidth(this.text));
      }
      this.line = text_struct.line || 0;
      this.smooth = text_struct.smooth || false;
      this.ignore_ticks = text_struct.ignore_ticks || false;
      this.justification = TextNote.Justification.LEFT;
    },

    setJustification: function(just) {
      this.justification = just;
      return this;
    },

    setLine: function(line) {
      this.line = line;
      return this;
    },

    // Pre-render formatting
    preFormat: function() {
      if (!this.context) throw new Vex.RERR("NoRenderContext",
          "Can't measure text without rendering context.");
      if (this.preFormatted) return;

      if (this.smooth) {
        this.setWidth(0);
      } else {
        if (this.glyph) {
          // Width already set.
        } else {
          this.setWidth(this.context.measureText(this.text).width);
        }
      }

      if (this.justification == TextNote.Justification.CENTER) {
        this.extraLeftPx = this.width / 2;
      } else if (this.justification == TextNote.Justification.RIGHT) {
        this.extraLeftPx = this.width;
      }

      this.setPreFormatted(true);
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

      var ctx = this.context;
      var x = this.getAbsoluteX();
      if (this.justification == TextNote.Justification.CENTER) {
        x -= this.getWidth() / 2;
      } else if (this.justification == TextNote.Justification.RIGHT) {
        x -= this.getWidth();
      }

      var y;
      if (this.glyph) {
        y = this.stave.getYForLine(this.line + (-3));
        this.glyph.render(this.context,
                          x + this.glyph_struct.x_shift,
                          y + this.glyph_struct.y_shift);
      } else {
        y = this.stave.getYForLine(this.line + (-3));
        ctx.save();
        ctx.setFont(this.font.family, this.font.size, this.font.weight);
        ctx.fillText(this.text, x, y);
        ctx.restore();
      }
    }
  });

  return TextNote;
}());
