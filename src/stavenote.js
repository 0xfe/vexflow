// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements notes for standard notation. This consists of one or 
// more `NoteHeads`, an optional stem, and an optional flag.
//
// *Throughout these comments, a "note" refers to the entire `StaveNote`,
// and a "key" refers to a specific pitch/notehead within a note.*
//
// See `tests/stavenote_tests.js` for usage examples.
Vex.Flow.StaveNote = (function() {
  var StaveNote = function(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  };

  // To enable logging for this class. Set `Vex.Flow.StaveNote.DEBUG` to `true`.
  function L() { if (StaveNote.DEBUG) Vex.L("Vex.Flow.StaveNote", arguments); }

  var Stem = Vex.Flow.Stem;
  var NoteHead = Vex.Flow.NoteHead;

  // Stem directions
  StaveNote.STEM_UP = Stem.UP;
  StaveNote.STEM_DOWN = Stem.DOWN;

  // ## Prototype Methods
  //
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

      // if true, displace note to right
      this.displaced = false;
      this.dot_shiftY = 0;
      // per-pitch properties
      this.keyProps = [];
      // for displaced ledger lines
      this.use_default_head_x = false;

      // Drawing
      this.note_heads = [];
      this.modifiers = [];

      Vex.Merge(this.render_options, {
        // font size for note heads and rests
        glyph_font_scale: 35,
        // number of stroke px to the left and right of head
        stroke_px: 3
      });

      this.calculateKeyProps();

      this.buildStem();

      // Set the stem direction
      if (note_struct.auto_stem) {
        this.autoStem();
      } else {
        this.setStemDirection(note_struct.stem_direction);
      }

      this.buildNoteHeads();

      // Calculate left/right padding
      this.calcExtraPx();
    },

    // Builds a `Stem` for the note
    buildStem: function() {
      var glyph = this.getGlyph();

      var y_extend = 0;
      if (glyph.code_head == "v95" || glyph.code_head == "v3e") {
         y_extend = -4;
      }

      var stem = new Stem({
        y_extend: y_extend
      });

      if (this.isRest()) {
        stem.hide = true;
      }

      this.setStem(stem);
    },

    // Builds a `NoteHead` for each key in the note
    buildNoteHeads: function() {
      var stem_direction = this.getStemDirection();

      var keys = this.getKeys();

      var last_line = null;
      var line_diff = null;
      var displaced = false;

      // Draw notes from bottom to top.
      var start_i = 0;
      var end_i = keys.length;
      var step_i = 1;

      // For down-stem notes, we draw from top to bottom.
      if (stem_direction === Stem.DOWN) {
        start_i = keys.length - 1;
        end_i = -1;
        step_i = -1;
      }

      for (var i = start_i; i != end_i; i += step_i) {
        var note_props = this.keyProps[i];

        var line = note_props.line;

        // Keep track of last line with a note head, so that consecutive heads
        // are correctly displaced.
        if (last_line === null) {
          last_line = line;
        } else {
          line_diff = Math.abs(last_line - line);
          if (line_diff === 0 || line_diff === 0.5) {
            displaced = !displaced;
          } else {
            displaced = false;
            this.use_default_head_x = true;
          }
        }
        last_line = line;

        var note_head = new NoteHead({
          duration: this.duration,
          note_type: this.noteType,
          displaced: displaced,
          stem_direction: stem_direction,
          custom_glyph_code: note_props.code,
          glyph_font_scale: this.render_options.glyph_font_scale,
          x_shift: note_props.shift_right,
          line: note_props.line
        });

        this.note_heads[i] = note_head;
      }
    },

    // Automatically sets the stem direction based on the keys in the note
    autoStem: function() {
      var auto_stem_direction;

      // Figure out optimal stem direction based on given notes
      this.min_line = this.keyProps[0].line;
      this.max_line = this.keyProps[this.keyProps.length - 1].line;
      var decider = (this.min_line + this.max_line) / 2;

      if (decider < 3) {
        auto_stem_direction = 1;
      } else {
        auto_stem_direction = -1;
      }

      this.setStemDirection(auto_stem_direction);
    },

    // Calculates and stores the properties for each key in the note
    calculateKeyProps: function() {
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
        if (last_line === null) {
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
      }

      // Sort the notes from lowest line to highest line
      this.keyProps.sort(function(a, b) { return a.line - b.line; });
    },

    // Get modifier category for `ModifierContext`
    getCategory: function() { return "stavenotes"; },

    // Get the `BoundingBox` for the entire note
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
        if (this.duration == "w" || this.duration == "h" ||
            this.duration == "1" || this.duration == "2") {
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

    // Gets the line number of the top or bottom note in the chord.
    // If `is_top_note` is `true` then get the top note
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

    // Determine if current note is a rest
    isRest: function() { return this.glyph.rest; },

    // Determine if the current note is a chord
    isChord: function() { return !this.isRest() && this.keys.length > 1; },

    // Determine if the `StaveNote` has a stem
    hasStem: function() { return this.glyph.stem; },

    // Get the `y` coordinate for text placed on the top/bottom of a
    // note at a desired `text_line`
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

    // Sets the current note to the provided `stave`. This applies
    // `y` values to the `NoteHeads`.
    setStave: function(stave) {
      var superclass = Vex.Flow.StaveNote.superclass;
      superclass.setStave.call(this, stave);

      var ys = this.note_heads.map(function(note_head) {
        note_head.setStave(stave);
        return note_head.getY();
      });

      this.setYs(ys);

      var bounds = this.getNoteHeadBounds();
      this.stem.setYBounds(bounds.y_top, bounds.y_bottom);

      return this;
    },

    // Get the pitches in the note
    getKeys: function() { return this.keys; },

    // Get the properties for all the keys in the note
    getKeyProps: function() {
      return this.keyProps;
    },

    // Check if note is shifted to the right
    isDisplaced: function() {
      return this.displaced;
    },

    // Sets whether shift note to the right. `displaced` is a `boolean`
    setNoteDisplaced: function(displaced) {
      this.displaced = displaced;
      return this;
    },

    // Get the starting `x` coordinate for a `StaveTie`
    getTieRightX: function() {
      var tieStartX = this.getAbsoluteX();
      tieStartX += this.glyph.head_width + this.x_shift + this.extraRightPx;
      if (this.modifierContext) tieStartX += this.modifierContext.getExtraRightPx();
      return tieStartX;
    },

    // Get the ending `x` coordinate for a `StaveTie`
    getTieLeftX: function() {
      var tieEndX = this.getAbsoluteX();
      tieEndX += this.x_shift - this.extraLeftPx;
      return tieEndX;
    },

    // Get the stave line on which to place a rest
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

    // Get the default `x` and `y` coordinates for the provided `position`
    // and key `index`
    getModifierStartXY: function(position, index) {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetModifierStartXY on an unformatted note");

      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "No Y-Values calculated for this note.");

      var x = 0;
      if (position == Vex.Flow.Modifier.Position.LEFT) {
        // extra_left_px
        x = -1 * 2;
      } else if (position == Vex.Flow.Modifier.Position.RIGHT) {
        // extra_right_px
        x = this.glyph.head_width + this.x_shift + 2;
      } else if (position == Vex.Flow.Modifier.Position.BELOW ||
                 position == Vex.Flow.Modifier.Position.ABOVE) {
        x = this.glyph.head_width / 2;
      }

      return { x: this.getAbsoluteX() + x, y: this.ys[index] };
    },

    // Sets the notehead at `index` to the provided coloring `style`.
    //
    // `style` is an `object` with the following properties: `shadowColor`,
    // `shadowBlur`, `fillStyle`, `strokeStyle`
    setKeyStyle: function(index, style) {
      this.note_heads[index].setStyle(style);
      return this;
    },

    // Add self to modifier context. `mContext` is the `ModifierContext`
    // to be added to.
    addToModifierContext: function(mContext) {
      this.setModifierContext(mContext);
      for (var i = 0; i < this.modifiers.length; ++i) {
        this.modifierContext.addModifier(this.modifiers[i]);
      }
      this.modifierContext.addModifier(this);
      this.setPreFormatted(false);
      return this;
    },

    // Generic function to add modifiers to a note
    // 
    // Parameters:
    // * `index`: The index of the key that we're modifying
    // * `modifier`: The modifier to add
    addModifier: function(index, modifier) {
      modifier.setNote(this);
      modifier.setIndex(index);
      this.modifiers.push(modifier);
      this.setPreFormatted(false);
      return this;
    },

    // Helper function to add an accidental to a key
    addAccidental: function(index, accidental) {
      return this.addModifier(index, accidental);
    },

    // Helper function to add an articulation to a key
    addArticulation: function(index, articulation) {
      return this.addModifier(index, articulation);
    },

    // Helper function to add an annotation to a key
    addAnnotation: function(index, annotation) {
      return this.addModifier(index, annotation);
    },

    // Helper function to add a dot on a specific key
    addDot: function(index) {
      var dot = new Vex.Flow.Dot();
      dot.setDotShiftY(this.glyph.dot_shiftY);
      this.dots++;
      return this.addModifier(index, dot);
    },

    // Convenience method to add dot to all keys in note
    addDotToAll: function() {
      for (var i = 0; i < this.keys.length; ++i)
        this.addDot(i);
      return this;
    },

    // Get all accidentals in the `ModifierContext`
    getAccidentals: function() {
      return this.modifierContext.getModifiers("accidentals");
    },

    // Get all dots in the `ModifierContext`
    getDots: function() {
      return this.modifierContext.getModifiers("dots");
    },

    // Get the width of the note if it is displaced. Used for `Voice`
    // formatting
    getVoiceShiftWidth: function() {
      // TODO: may need to accomodate for dot here.
      return this.glyph.head_width * (this.displaced ? 2 : 1);
    },

    // Calculates and sets the extra pixels to the left or right
    // if the note is displaced
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
      if (this.glyph.flag && this.beam === null && this.stem_direction == 1) {
        width += this.glyph.head_width;
      }

      this.setWidth(width);
      this.setPreFormatted(true);
    },

    // Gets the staff line and y value for the highest and lowest noteheads
    getNoteHeadBounds: function() {
      // Top and bottom Y values for stem.
      var y_top = null;
      var y_bottom = null;

      var highest_line = this.stave.getNumLines();
      var lowest_line = 1;

      this.note_heads.forEach(function(note_head) {
        var line = note_head.getLine();
        var y = note_head.getY();

        if (y_top === null || y < y_top)  {
          y_top = y;
        }

        if (y_bottom === null || y > y_bottom) {
          y_bottom = y;
        }

        highest_line = line > highest_line ? line : highest_line;
        lowest_line = line < lowest_line ? line : lowest_line;

      }, this);

      return {
        y_top: y_top,
        y_bottom: y_bottom,
        highest_line: highest_line,
        lowest_line: lowest_line
      };
    },

    // Get the starting `x` coordinate for the noteheads
    getNoteHeadBeginX: function(){
      return this.getAbsoluteX() + this.x_shift;
    },

    // Get the ending `x` coordinate for the noteheads
    getNoteHeadEndX: function(){
      var x_begin = this.getNoteHeadBeginX();
      return x_begin + this.glyph.head_width - (Vex.Flow.STEM_WIDTH / 2);
    },

    // Draw the ledger lines between the stave and the highest/lowest keys
    drawLedgerLines: function(){
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      var ctx = this.context;

      var bounds = this.getNoteHeadBounds();
      var highest_line = bounds.highest_line;
      var lowest_line = bounds.lowest_line;
      var head_x = this.note_heads[0].getAbsoluteX();

      var that = this;
      function stroke(y) {
        if (that.use_default_head_x === true)  {
          head_x = that.getAbsoluteX() + that.x_shift;
        }
        var x = head_x - that.render_options.stroke_px;
        var length = ((head_x + that.glyph.head_width) - head_x) +
          (that.render_options.stroke_px * 2);

        ctx.fillRect(x, y, length, 1);
      }

      var line; // iterator
      for (line = 6; line <= highest_line; ++line) {
        stroke(this.stave.getYForNote(line));
      }

      for (line = 0; line >= lowest_line; --line) {
        stroke(this.stave.getYForNote(line));
      }
    },

    // Draw all key modifiers
    drawModifiers: function(){
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      var ctx = this.context;
      for (var i = 0; i < this.modifiers.length; i++) {
        var mod = this.modifiers[i];
        var note_head = this.note_heads[mod.getIndex()];
        var key_style = note_head.getStyle();
        if(key_style) {
            ctx.save();
            note_head.applyKeyStyle(ctx);
        }
        mod.setContext(ctx);
        mod.draw();
        if(key_style) {
            ctx.restore();
        }
      }
    },

    // Draw the flag for the note
    drawFlag: function(){
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      var ctx = this.context;
      var glyph = this.getGlyph();
      var render_flag = this.beam === null;
      var bounds = this.getNoteHeadBounds();

      var x_begin = this.getNoteHeadBeginX();
      var x_end = this.getNoteHeadEndX();

      if (glyph.flag && render_flag) {
        var note_stem_height = this.stem.getHeight();
        var flag_x, flag_y, flag_code;

        if (this.getStemDirection() === Stem.DOWN) {
          // Down stems have flags on the left.
          flag_x = x_begin + 1;
          flag_y = bounds.y_top - note_stem_height + 2;
          flag_code = glyph.code_flag_downstem;

        } else {
          // Up stems have flags on the left.
          flag_x = x_end + 1;
          flag_y = bounds.y_bottom - note_stem_height - 2;
          flag_code = glyph.code_flag_upstem;
        }

        // Draw the Flag
        Vex.Flow.renderGlyph(ctx, flag_x, flag_y,
            this.render_options.glyph_font_scale, flag_code);
      }
    },

    // Draw the NoteHeads
    drawNoteHeads: function(){
      this.note_heads.forEach(function(note_head) {
        note_head.setContext(this.context).draw();
      }, this);
    },

    // Render the stem onto the canvas
    drawStem: function(stem_struct){
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      if (stem_struct) {
        this.setStem(new Stem(stem_struct));
      }
      
      this.stem.setContext(this.context).draw();
    },

    // Draws all the `StaveNote` parts. This is the main drawing method.
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      if (!this.stave) throw new Vex.RERR("NoStave",
          "Can't draw without a stave.");
      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "Can't draw note without Y values.");

      var x_begin = this.getNoteHeadBeginX();
      var x_end = this.getNoteHeadEndX();

      var render_stem = this.hasStem() && !this.beam;

      // Format note head x positions
      this.note_heads.forEach(function(note_head) {
        note_head.setX(x_begin);
      }, this);

      // Format stem x positions
      this.stem.setNoteHeadXBounds(x_begin, x_end);

      L("Rendering ", this.isChord() ? "chord :" : "note :", this.keys);

      // Draw each part of the note
      this.drawLedgerLines();
      if (render_stem) this.drawStem();
      this.drawNoteHeads();
      this.drawFlag();
      this.drawModifiers();
    }
  });

  return StaveNote;
}());
