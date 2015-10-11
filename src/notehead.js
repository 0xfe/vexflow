// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `NoteHeads`. `NoteHeads` are typically not manipulated
// directly, but used internally in `StaveNote`.
//
// See `tests/notehead_tests.js` for usage examples.
Vex.Flow.NoteHead = (function() {
  var NoteHead = function(head_options) {
    if (arguments.length > 0) this.init(head_options);
  };

  // To enable logging for this class. Set `Vex.Flow.NoteHead.DEBUG` to `true`.
  function L() { if (NoteHead.DEBUG) Vex.L("Vex.Flow.NoteHead", arguments); }


  // Draw slashnote head manually. No glyph exists for this.
  //
  // Parameters:
  // * `ctx`: the Canvas context
  // * `duration`: the duration of the note. ex: "4"
  // * `x`: the x coordinate to draw at
  // * `y`: the y coordinate to draw at
  // * `stem_direction`: the direction of the stem
  function drawSlashNoteHead(ctx, duration, x, y, stem_direction) {
    var width = 15 + (Vex.Flow.STEM_WIDTH / 2);
    ctx.save();
    ctx.setLineWidth(Vex.Flow.STEM_WIDTH);

    var fill = false;

    if (Vex.Flow.durationToNumber(duration) > 2) {
      fill = true;
    }

    if (!fill) x -= (Vex.Flow.STEM_WIDTH / 2) * stem_direction;

    ctx.beginPath();
    ctx.moveTo(x, y + 11);
    ctx.lineTo(x, y + 1);
    ctx.lineTo(x + width, y - 10);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y + 11);
    ctx.closePath();

    if (fill) {
       ctx.fill();
    } else {
       ctx.stroke();
    }

    if (Vex.Flow.durationToFraction(duration).equals(0.5)) {
      var breve_lines = [-3, -1, width + 1, width + 3];
      for(var i=0; i<breve_lines.length; i++){
          ctx.beginPath();
          ctx.moveTo(x + breve_lines[i], y - 10);
          ctx.lineTo(x + breve_lines[i], y + 11);
          ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ## Prototype Methods
  Vex.Inherit(NoteHead, Vex.Flow.Note, {
    init: function(head_options) {
      NoteHead.superclass.init.call(this, head_options);
      this.index = head_options.index;
      this.x = head_options.x || 0;
      this.y = head_options.y || 0;
      this.note_type = head_options.note_type;
      this.duration = head_options.duration;
      this.displaced = head_options.displaced || false;
      this.stem_direction = head_options.stem_direction || Vex.Flow.StaveNote.STEM_UP;
      this.line = head_options.line;

      // Get glyph code based on duration and note type. This could be
      // regular notes, rests, or other custom codes.
      this.glyph = Vex.Flow.durationToGlyph(this.duration, this.note_type);
      if (!this.glyph) {
        throw new Vex.RuntimeError("BadArguments",
            "No glyph found for duration '" + this.duration +
            "' and type '" + this.note_type + "'");
      }

      this.glyph_code = this.glyph.code_head;
      this.x_shift = head_options.x_shift;
      if (head_options.custom_glyph_code) {
        this.custom_glyph = true;
        this.glyph_code = head_options.custom_glyph_code;
      }

      this.context = null;
      this.style = head_options.style;
      this.slashed = head_options.slashed;

      Vex.Merge(this.render_options, {
        glyph_font_scale: 35, // font size for note heads
        stroke_px: 3         // number of stroke px to the left and right of head
      });

      if (head_options.glyph_font_scale) {
        this.render_options.glyph_font_scale = head_options.glyph_font_scale;
      }

      this.setWidth(this.glyph.head_width);
    },

    // Get the `ModifierContext` category
    getCategory: function() { return "notehead"; },

    // Set the Cavnas context for drawing
    setContext: function(context) { this.context = context; return this;},

    // Get the width of the notehead
    getWidth: function() { return this.width; },

    // Determine if the notehead is displaced
    isDisplaced: function() { return this.displaced === true; },

    // Get/set the notehead's style
    //
    // `style` is an `object` with the following properties: `shadowColor`,
    // `shadowBlur`, `fillStyle`, `strokeStyle`
    getStyle: function() { return this.style; },
    setStyle: function(style) { this.style = style; return this; },

    // Get the glyph data
    getGlyph: function(){ return this.glyph; },

    // Set the X coordinate
    setX: function(x){ this.x = x; return this; },

    // get/set the Y coordinate
    getY: function() { return this.y; },
    setY: function(y) { this.y = y;  return this; },

    // Get/set the stave line the notehead is placed on
    getLine: function() { return this.line; },
    setLine: function(line) { this.line = line; return this; },

    // Get the canvas `x` coordinate position of the notehead.
    getAbsoluteX: function() {
      var getAbsoluteX = NoteHead.superclass.getAbsoluteX;

      // If the note has not been preformatted, then get the static x value
      // Otherwise, it's been formatted and we should use it's x value relative
      // to its tick context
      var x = !this.preFormatted ? this.x : getAbsoluteX.call(this);

      return x + (this.displaced ? this.width * this.stem_direction : 0);
    },

    // Get the `BoundingBox` for the `NoteHead`
    getBoundingBox: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call getBoundingBox on an unformatted note.");

      var spacing = this.stave.getSpacingBetweenLines();
      var half_spacing = spacing/2;
      var min_y = this.y - half_spacing;

      return new Vex.Flow.BoundingBox(this.getAbsoluteX(), min_y, this.width, spacing);
    },

    // Apply current style to Canvas `context`
    applyStyle: function(context) {
      var style = this.getStyle();
      if (style.shadowColor) context.setShadowColor(style.shadowColor);
      if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
      if (style.fillStyle) context.setFillStyle(style.fillStyle);
      if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
      return this;
    },

    // Set notehead to a provided `stave`
    setStave: function(stave){
      var line = this.getLine();

      this.stave = stave;
      this.setY(stave.getYForNote(line));
      this.context = this.stave.context;
      return this;
    },

    // Pre-render formatting
    preFormat: function() {
      if (this.preFormatted) return this;

      var glyph = this.getGlyph();
      var width = glyph.head_width + this.extraLeftPx + this.extraRightPx;

      this.setWidth(width);
      this.setPreFormatted(true);
      return this;
    },

    // Draw the notehead
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      var ctx = this.context;
      var head_x = this.getAbsoluteX();
      var y = this.y;

      L("Drawing note head '", this.note_type, this.duration, "' at", head_x, y);

      // Begin and end positions for head.
      var stem_direction = this.stem_direction;
      var glyph_font_scale = this.render_options.glyph_font_scale;

      var line = this.line;

      // If note above/below the staff, draw the small staff
      if (line <= 0 || line >= 6) {
        var line_y = y;
        var floor = Math.floor(line);
        if (line < 0 && floor - line == -0.5)
          line_y -= 5;
        else if (line > 6 &&  floor - line == -0.5)
          line_y += 5;
        if (this.note_type != 'r') {
          ctx.fillRect(
            head_x - this.render_options.stroke_px, line_y,
            (this.getGlyph().head_width) +
            (this.render_options.stroke_px * 2), 1);
        }
      }

      if (this.note_type == "s") {
        drawSlashNoteHead(ctx, this.duration,
          head_x, y, stem_direction);
      } else {
        if (this.style) {
          ctx.save();
          this.applyStyle(ctx);
          Vex.Flow.renderGlyph(ctx, head_x, y, glyph_font_scale, this.glyph_code);
          ctx.restore();
        } else {
          Vex.Flow.renderGlyph(ctx, head_x, y, glyph_font_scale, this.glyph_code);
        }
      }
    }
  });

  return NoteHead;
}());
