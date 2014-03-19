// Vex Flow - Stave Note implementation.
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

Vex.Flow.StaveNote = (function() {
  var StaveNote = function(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  };

  // Stem directions
  var Stem = Vex.Flow.Stem;
  var NoteHead = Vex.Flow.NoteHead;

  StaveNote.STEM_UP = Stem.UP;
  StaveNote.STEM_DOWN = Stem.DOWN;

  Vex.Inherit(StaveNote, Vex.Flow.StemmableNote, {
    init: function(note_struct) {
      StaveNote.superclass.init.call(this, note_struct);

      this.keys = note_struct.keys;
      this.clef = note_struct.clef;
      this.beam = null;

      // Pull note rendering properties
      this.glyph = Vex.Flow.durationToGlyph(this.duration, this.noteType);
      if (!this.glyph) {
        throw new Vex.RuntimeError("BadArguments",
            "Invalid note initialization data (No glyph found): " +
            JSON.stringify(note_struct));
      }

      this.notes_displaced = false;   // if true, displace note to right
      this.dot_shiftY = 0;
      this.keyProps = [];             // per-note properties
      this.keyStyles = [];            // per-note colors or gradients

      // Pull per-note location and other rendering properties.
      this.displaced = false;
      var last_line = null;
      for (var i = 0; i < this.keys.length; ++i) {
        var key = this.keys[i];

        // All rests use the same position on the line.
        // if (this.glyph.rest) key = this.glyph.position;
        if (this.glyph.rest) this.glyph.position = key;
        var props = Vex.Flow.keyProperties(key, this.clef);
        if (!props) {
          throw new Vex.RuntimeError("BadArguments",
              "Invalid key for note properties: " + key);
        }

        // Calculate displacement of this note
        var line = props.line;
        if (last_line == null) {
          last_line = line;
        } else {
          if (Math.abs(last_line - line) == 0.5) {
            this.displaced = true;
            props.displaced = true;

            // Have to mark the previous note as
            // displaced as well, for modifier placement
            if (this.keyProps.length > 0) {
                this.keyProps[i-1].displaced = true;
            }
          }
        }

        last_line = line;
        this.keyProps.push(props);
        this.keyStyles.push(null);
      }

      // Sort the notes from lowest line to highest line
      this.keyProps.sort(function(a, b) { return a.line - b.line; });

      // Drawing
      this.modifiers = [];

      Vex.Merge(this.render_options, {
        glyph_font_scale: 35, // font size for note heads and rests
        stroke_px: 3,         // number of stroke px to the left and right of head
        stroke_spacing: 10    // spacing between strokes (TODO: take from stave)
      });

      switch (this.duration) {
        case "w":                 // Whole note alias
        case "1": this.stem_extension = -1 * Stem.HEIGHT; break;
        case "32": this.stem_extension = 10; break;
        case "64": this.stem_extension = 15; break;
        case "128": this.stem_extension = 20; break;
        default: this.stem_extension = 0;
      }

      var auto_stem_direction;
      if (note_struct.auto_stem) {
        // Figure out optimal stem direction based on given notes
        this.min_line = this.keyProps[0].line;
        if (this.min_line < 3) {
          auto_stem_direction = 1;
        } else {
          auto_stem_direction = -1;
        }
        this.setStemDirection(auto_stem_direction);
      } else {
        this.setStemDirection(note_struct.stem_direction);
      }

      // Calculate left/right padding
      this.calcExtraPx();
    },

    getCategory: function() { return "stavenotes"; },

    getBoundingBox: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call getBoundingBox on an unformatted note.");

      var metrics = this.getMetrics();

      var w = metrics.width;
      var x = this.getAbsoluteX() - metrics.modLeftPx - metrics.extraLeftPx;

      var min_y = 0;
      var max_y = 0;
      var half_line_spacing = this.getStave().getSpacingBetweenLines() / 2;
      var line_spacing = half_line_spacing * 2;

      if (this.isRest()) {
        var y = this.ys[0];
        if (this.duration == "w" || this.duration == "h" || this.duration == "1" || this.duration == "2") {
          min_y = y - half_line_spacing;
          max_y = y + half_line_spacing;
        } else {
          min_y = y - (this.glyph.line_above * line_spacing);
          max_y = y + (this.glyph.line_below * line_spacing);
        }
      } else if (this.glyph.stem) {
        var ys = this.getStemExtents();
        ys.baseY += half_line_spacing * this.stem_direction;
        min_y = Vex.Min(ys.topY, ys.baseY);
        max_y = Vex.Max(ys.topY, ys.baseY);
      } else {
        min_y = null;
        max_y = null;

        for (var i=0; i < this.ys.length; ++i) {
          var yy = this.ys[i];
          if (i === 0) {
            min_y = yy;
            max_y = yy;
          } else {
            min_y = Vex.Min(yy, min_y);
            max_y = Vex.Max(yy, max_y);
          }
          min_y -= half_line_spacing;
          max_y += half_line_spacing;
        }
      }

      return new Vex.Flow.BoundingBox(x, min_y, w, max_y - min_y);
    },

    /** Gets the line number of the top or bottom note in the chord.
      * If (is_top_note === true), get top note
      * Otherwise, get bottom note */
    getLineNumber: function(is_top_note) {
      if(!this.keyProps.length) throw new Vex.RERR("NoKeyProps",
          "Can't get bottom note line, because note is not initialized properly.");
      var result_line = this.keyProps[0].line;

      // No precondition assumed for sortedness of keyProps array
      for(var i=0; i<this.keyProps.length; i++){
        var this_line = this.keyProps[i].line;
        if(is_top_note)
          if(this_line > result_line)
                result_line = this_line;
        else
          if(this_line < result_line)
            result_line = this_line;
      }

      return result_line;
    },

    isRest: function() {
      return this.glyph.rest;
    },

    hasStem: function() {
      return this.glyph.stem;
    },

    getYForTopText: function(text_line) {
      var extents = this.getStemExtents();
      return Vex.Min(this.stave.getYForTopText(text_line),
          extents.topY - (this.render_options.annotation_spacing * (text_line + 1)));
    },

    getYForBottomText: function(text_line) {
      var extents = this.getStemExtents();
      return Vex.Max(this.stave.getYForTopText(text_line),
          extents.baseY + (this.render_options.annotation_spacing * (text_line)));
    },

    setStave: function(stave) {
      var superclass = Vex.Flow.StaveNote.superclass;
      superclass.setStave.call(this, stave);
      var ys = [];

      // Setup y coordinates for score.
      for (var i = 0; i < this.keyProps.length; ++i) {
        var line = this.keyProps[i].line;
        ys.push(this.stave.getYForNote(line));
      }

      return this.setYs(ys);
    },

    // Get individual note/octave pairs for all notes in this
    // chord.
    getKeys: function() {
      return this.keys;
    },

    // Get the Key Properties for each note in chord
    getKeyProps: function() {
      return this.keyProps;
    },

    // Check if note is manually shifted to the right
    isDisplaced: function() {
      return this.notes_displaced;
    },
    // Manual setting of note shift to the right
    setNoteDisplaced: function(displaced) {
      this.notes_displaced = displaced;
      return this;
    },

    getTieRightX: function() {
      var tieStartX = this.getAbsoluteX();
      tieStartX += this.glyph.head_width + this.x_shift + this.extraRightPx;
      if (this.modifierContext) tieStartX += this.modifierContext.getExtraRightPx();
      return tieStartX;
    },

    getTieLeftX: function() {
      var tieEndX = this.getAbsoluteX();
      tieEndX += this.x_shift - this.extraLeftPx;
      return tieEndX;
    },

    getLineForRest: function() {
      var rest_line = this.keyProps[0].line;
      if (this.keyProps.length > 1) {
        var last_line  = this.keyProps[this.keyProps.length - 1].line;
        var top = Vex.Max(rest_line, last_line);
        var bot = Vex.Min(rest_line, last_line);
        rest_line = Vex.MidLine(top, bot);
      }

      return rest_line;
    },

    getModifierStartXY: function(position, index) {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetModifierStartXY on an unformatted note");

      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "No Y-Values calculated for this note.");

      var x = 0;
      if (position == Vex.Flow.Modifier.Position.LEFT) {
        x = -1 * 2;  // extra_left_px
      } else if (position == Vex.Flow.Modifier.Position.RIGHT) {
        x = this.glyph.head_width + this.x_shift + 2; // extra_right_px
      } else if (position == Vex.Flow.Modifier.Position.BELOW ||
                 position == Vex.Flow.Modifier.Position.ABOVE) {
        x = this.glyph.head_width / 2;
      }

      return { x: this.getAbsoluteX() + x, y: this.ys[index] };
    },

    setKeyStyle: function(index, style) {
      this.keyStyles[index] = style;
      return this;
    },

    applyKeyStyle: function(key_style, context) {
      if (key_style) {
        if (key_style.shadowColor) context.setShadowColor(key_style.shadowColor);
        if (key_style.shadowBlur) context.setShadowBlur(key_style.shadowBlur);
        if (key_style.fillStyle) context.setFillStyle(key_style.fillStyle);
        if (key_style.strokeStyle) context.setStrokeStyle(key_style.strokeStyle);
      }
    },

    // Add self to modifier context "mc".
    addToModifierContext: function(mc) {
      this.setModifierContext(mc);
      for (var i = 0; i < this.modifiers.length; ++i) {
        this.modifierContext.addModifier(this.modifiers[i]);
      }
      this.modifierContext.addModifier(this);
      this.setPreFormatted(false);
      return this;
    },

    // Generic function to add modifiers to a note
    addModifier: function(index, modifier) {
      modifier.setNote(this);
      modifier.setIndex(index);
      this.modifiers.push(modifier);
      this.setPreFormatted(false);
      return this;
    },

    addAccidental: function(index, accidental) {
      return this.addModifier(index, accidental);
    },

    addArticulation: function(index, articulation) {
      return this.addModifier(index, articulation);
    },

    addAnnotation: function(index, annotation) {
      return this.addModifier(index, annotation);
    },


    addDot: function(index) {
      var dot = new Vex.Flow.Dot();
      dot.setDotShiftY(this.glyph.dot_shiftY);
      this.dots++;
      return this.addModifier(index, dot);
    },

    // Convenience method to add dot to all notes in chord
    addDotToAll: function() {
      for (var i = 0; i < this.keys.length; ++i)
        this.addDot(i);
      return this;
    },

    getAccidentals: function() {
      return this.modifierContext.getModifiers("accidentals");
    },

    getDots: function() {
      return this.modifierContext.getModifiers("dots");
    },

    getVoiceShiftWidth: function() {
      // TODO: may need to accomodate for dot here.
      return this.glyph.head_width * (this.displaced ? 2 : 1);
    },

    calcExtraPx: function() {
      this.setExtraLeftPx((this.displaced && this.stem_direction == -1) ?
          this.glyph.head_width : 0);
      this.setExtraRightPx((this.displaced && this.stem_direction == 1) ?
          this.glyph.head_width : 0);
    },

    // Pre-render formatting
    preFormat: function() {
      if (this.preFormatted) return;
      if (this.modifierContext) this.modifierContext.preFormat();

      var width = this.glyph.head_width + this.extraLeftPx + this.extraRightPx;

      // For upward flagged notes, the width of the flag needs to be added
      if (this.glyph.flag && this.beam == null && this.stem_direction == 1) {
        width += this.glyph.head_width;
      }

      this.setWidth(width);
      this.setPreFormatted(true);
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "Can't draw note without Y values.");

      var ctx = this.context;
      var x = this.getAbsoluteX() + this.x_shift;

      var ys = this.ys;
      var keys = this.keys;
      var glyph = this.glyph;
      var stem_direction = this.stem_direction;
      var default_head_x = null;

      // What elements do we render?
      var render_stem = (this.beam == null);
      var render_flag = (this.beam == null);

      // Begin and end positions for head.
      var x_begin = x;
      var x_end = x + glyph.head_width - (Vex.Flow.STEM_WIDTH / 2);

      // Top and bottom Y values for stem.
      var y_top = null;
      var y_bottom = null;

      // Displacement variables.
      var last_line = null;
      var line_diff = null;
      var displaced = false;

      // Draw notes from bottom to top.
      var start_i = 0;
      var end_i = keys.length;
      var step_i = 1;


      // For down-stem notes, we draw from top to bottom.
      if (stem_direction == Stem.DOWN) {
        start_i = keys.length - 1;
        end_i = -1;
        step_i = -1;
      }

      // Keep track of highest and lowest lines for drawing strokes.
      var highest_line = 5;
      var lowest_line = 1;

      // For each note (key) in the chord, calculate strokes, displacements,
      // and render the head.
      var i, key_style, line;
      for (i = start_i; i != end_i; i += step_i) {
        var note_props = this.keyProps[i];
        key_style = this.keyStyles[i];
        line = note_props.line;
        highest_line = line > highest_line ? line : highest_line;
        lowest_line = line < lowest_line ? line : lowest_line;

        // Keep track of last line with a note head, so that consecutive heads
        // are correctly displaced.
        if (last_line == null) {
          last_line = line;
        } else {
          line_diff = Math.abs(last_line - line);
          if (line_diff === 0 || line_diff === 0.5) {
            displaced = !displaced;
          } else {
            displaced = false;
            default_head_x = x;
          }
        }
        last_line = line;

        // Get Y value for this head.
        var y = ys[i];

        // Keep track of top and bottom note for stem
        if (y_top == null || y < y_top) y_top = y;
        if (y_bottom == null || y > y_bottom) y_bottom = y;

        var note_head = new NoteHead({
          x: x_begin,
          y: y,
          note_type: this.noteType,
          custom_glyph_code: note_props.code,
          x_shift: note_props.shift_right,
          duration: this.duration,
          displaced: displaced,
          stem_direction: stem_direction,
          key_style: key_style,
          glyph_font_scale: this.render_options.glyph_font_scale
        });

        var head_x = note_head.getAbsoluteX();

        note_head.setContext(this.context).draw();

        // If note above/below the staff, draw the small staff
        if (line <= 0 || line >= 6) {
          var line_y = y;
          var floor = Math.floor(line);
          if (line < 0 && floor - line == -0.5)
            line_y -= 5;
          else if (line > 6 &&  floor - line == -0.5)
            line_y += 5;
          ctx.fillRect(
            head_x - this.render_options.stroke_px, line_y,
            ((head_x + glyph.head_width) - head_x) +
            (this.render_options.stroke_px * 2), 1);
        }
      }

      // For heads that are off the staff, draw the tiny stroke line.
      var that = this;

      function stroke(y) {
        if (default_head_x != null) head_x = default_head_x;
        ctx.fillRect(
          head_x - that.render_options.stroke_px, y,
          ((head_x + glyph.head_width) - head_x) +
          (that.render_options.stroke_px * 2), 1);
      }

      for (line = 6; line <= highest_line; ++line) {
        stroke(this.stave.getYForNote(line));
      }

      for (line = 0; line >= lowest_line; --line) {
        stroke(this.stave.getYForNote(line));
      }

      // Draw Stem
      if (this.hasStem() && render_stem) {
        // Shorten stem length for 1/2 & 1/4 dead note heads (X)
        var y_extend = 0;
        if (glyph.code_head == "v95" ||
            glyph.code_head == "v3e") {
           y_extend = -4;
        }

        this.drawStem({
          x_begin: x_begin,
          x_end: x_end,
          y_top: y_top,
          y_bottom: y_bottom,
          y_extend: y_extend,
          stem_extension: this.stem_extension,
          stem_direction: stem_direction
        });
      }

      // Now it's the flag's turn.
      if (glyph.flag && render_flag) {
        var note_stem_height = this.stem.getHeight();
        var flag_x, flag_y, flag_code;

        if (stem_direction == Stem.DOWN) {
          // Down stems have flags on the left.
          flag_x = x_begin + 1;
          flag_y = y_top - note_stem_height;
          flag_code = glyph.code_flag_downstem;

        } else {
          // Up stems have flags on the left.
          flag_x = x_end + 1;
          flag_y = y_bottom - note_stem_height;
          flag_code = glyph.code_flag_upstem;
        }

        // Draw the Flag
        Vex.Flow.renderGlyph(ctx, flag_x, flag_y,
            this.render_options.glyph_font_scale, flag_code);
      }

      // Draw the modifiers
      for (i = 0; i < this.modifiers.length; ++i) {
        var mod = this.modifiers[i];
        key_style = this.keyStyles[mod.getIndex()];
        if(key_style) {
            ctx.save();
            this.applyKeyStyle(key_style, ctx);
        }
        mod.setContext(ctx);
        mod.draw();
        if(key_style) {
            ctx.restore();
        }
      }
    }
  });

  return StaveNote;
}());
