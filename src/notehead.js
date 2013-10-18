// Vex Flow - Note head implementation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

Vex.Flow.NoteHead = (function() {
  var NoteHead = function(head_options) {
    if (arguments.length > 0) this.init(head_options);
  };

  // Draw slashnote head manually. No glyph exists for this.
  function drawSlashNoteHead(ctx, duration, x, y) {
    var width = 15 + (Vex.Flow.STEM_WIDTH / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + 11);
    ctx.lineTo(x, y + 1);
    ctx.lineTo(x + width, y - 10);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y + 11);
    ctx.closePath();

    // only fill if quarter note or smaller
    if (duration != 1 &&
        duration != 2 &&
        duration != "h" &&
        duration != "w") {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  NoteHead.prototype = {
    init: function(head_options) {
      this.x = head_options.x;
      this.y = head_options.y;
      this.note_type = head_options.note_type;
      this.duration = head_options.duration;
      this.displaced = head_options.displaced;
      this.stem_direction = head_options.stem_direction;

      // Get glyph code based on duration and note type. This could be
      // regular notes, rests, or other custom codes.
      this.glyph = Vex.Flow.durationToGlyph(this.duration, this.note_type);
      if (!this.glyph) {
        throw new Vex.RuntimeError("BadArguments",
            "Invalid note initialization data (No glyph found): " +
            JSON.stringify(note_struct));
      }

      this.width = this.glyph.head_width;
      this.glyph_code = this.glyph.code_head;
      this.absolute_x = this.x + (this.displaced ? this.width * this.stem_direction : 0);
      if (head_options.custom_glyph_code) {
        this.glyph_code = head_options.custom_glyph_code;
        this.absolute_x = this.x + head_options.x_shift;
      }
      this.glyph_font_scale = head_options.glyph_font_scale;
      this.context = null;
      this.key_style = null;
      this.slashed = head_options.slashed;
    },

    getCategory: function() { return "notehead"; },
    setContext: function(context) { this.context = context; return this;},
    getWidth: function() { return this.width; },
    getAbsoluteX: function() { return this.absolute_x; },

    getBoundingBox: function() {
      throw new Vex.RERR("NotImplemented", "getBoundingBox() not implemented.");
    },

    applyKeyStyle: function(key_style, context) {
      if (key_style.shadowColor) context.setShadowColor(key_style.shadowColor);
      if (key_style.shadowBlur) context.setShadowBlur(key_style.shadowBlur);
      if (key_style.fillStyle) context.setFillStyle(key_style.fillStyle);
      if (key_style.strokeStyle) context.setStrokeStyle(key_style.strokeStyle);
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      var ctx = this.context;
      var head_x = this.absolute_x;
      var y = this.y;

      // Begin and end positions for head.
      var displaced = this.displaced;
      var stem_direction = this.stem_direction;
      var glyph_font_scale = this.glyph_font_scale;
      var key_style = this.key_style;

      var code_head = this.glyph_code;
      var width = this.width;

      if (this.note_type == "s") {
        var displacement = Vex.Flow.STEM_WIDTH / 2;
        drawSlashNoteHead(ctx, this.duration,
          head_x + (stem_direction == 1 ? -displacement : displacement), y);
      } else {
        if (key_style) {
          ctx.save();
          this.applyKeyStyle(key_style, ctx);
          Vex.Flow.renderGlyph(ctx, head_x, y, glyph_font_scale, code_head);
          ctx.restore();
        } else {
          console.log(code_head);
          Vex.Flow.renderGlyph(ctx, head_x, y, glyph_font_scale, code_head);
        }
      }
    }
  };

  return NoteHead;
}());
