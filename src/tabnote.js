// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.TabNote = (function() {
  function TabNote(tab_struct) {
    if (arguments.length > 0) this.init(tab_struct);
  }

  var Stem = Vex.Flow.Stem;

  Vex.Inherit(TabNote, Vex.Flow.StemmableNote, {
    init: function(tab_struct) {
      var superclass = Vex.Flow.TabNote.superclass;
      superclass.init.call(this, tab_struct);

      // Note properties
      this.positions = tab_struct.positions; // [{ str: X, fret: X }]
      this.render_options = {
        glyph_font_scale: 30, // font size for note heads and rests
        draw_stem: false,
        draw_dots: false
      };

      this.glyph =
        Vex.Flow.durationToGlyph(this.duration, this.noteType);
      if (!this.glyph) {
        throw new Vex.RuntimeError("BadArguments",
            "Invalid note initialization data (No glyph found): " +
            JSON.stringify(tab_struct));
      }

      switch (this.duration) {
        case "w":                 // Whole note alias
        case "1": this.stem_extension = -1 * Stem.HEIGHT; break;

        case "32": this.stem_extension = 5; break;
        case "64": this.stem_extension = 10; break;
        case "128": this.stem_extension = 15; break;
        default: this.stem_extension = 0;
      }

      this.ghost = false; // Renders parenthesis around notes
      this.updateWidth();
    },

    getCategory: function() { return "tabnotes"; },
    setGhost: function(ghost) {
      this.ghost = ghost;
      this.updateWidth();
      return this;
    },

    hasStem: function() {
      return this.glyph.stem;
    },

    getGlyph: function() {
      return this.glyph;
    },

    addDot: function() {
      var dot = new Vex.Flow.Dot();
      this.dots++;
      return this.addModifier(dot, 0);
    },

    updateWidth: function() {
      this.glyphs = [];
      this.width = 0;
      for (var i = 0; i < this.positions.length; ++i) {
        var fret = this.positions[i].fret;
        if (this.ghost) fret = "(" + fret + ")";
        var glyph = Vex.Flow.tabToGlyph(fret);
        this.glyphs.push(glyph);
        this.width = (glyph.width > this.width) ? glyph.width : this.width;
      }
    },

    setStave: function(stave) {
      var superclass = Vex.Flow.TabNote.superclass;
      superclass.setStave.call(this, stave);
      this.context = stave.context;
      this.width = 0;

      // Calculate the fret number width based on font used
      var i;
      if (this.context) {
        for (i = 0; i < this.glyphs.length; ++i) {
          var text = "" + this.glyphs[i].text;
          if (text.toUpperCase() != "X")
            this.glyphs[i].width = this.context.measureText(text).width;
          this.width = (this.glyphs[i].width > this.width) ?
            this.glyphs[i].width : this.width;
        }
      }

      var ys = [];

      // Setup y coordinates for score.
      for (i = 0; i < this.positions.length; ++i) {
        var line = this.positions[i].str;
        ys.push(this.stave.getYForLine(line - 1));
      }

      return this.setYs(ys);
    },

    // Get the Tab Positions for each note in chord
    getPositions: function() {
      return this.positions;
    },

    addToModifierContext: function(mc) {
      this.setModifierContext(mc);
      for (var i = 0; i < this.modifiers.length; ++i) {
        this.modifierContext.addModifier(this.modifiers[i]);
      }
      this.modifierContext.addModifier(this);
      this.preFormatted = false;
      return this;
    },

    getTieRightX: function() {
      var tieStartX = this.getAbsoluteX();
      var note_glyph_width = this.glyph.head_width;
      tieStartX += (note_glyph_width / 2);
      tieStartX += ((-this.width / 2) + this.width + 2);

      return tieStartX;
    },

    getTieLeftX: function() {
      var tieEndX = this.getAbsoluteX();
      var note_glyph_width = this.glyph.head_width;
      tieEndX += (note_glyph_width / 2);
      tieEndX -= ((this.width / 2) + 2);

      return tieEndX;
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
        x = this.width + 2; // extra_right_px
      } else if (position == Vex.Flow.Modifier.Position.BELOW ||
                 position == Vex.Flow.Modifier.Position.ABOVE) {
          var note_glyph_width = this.glyph.head_width;
          x = note_glyph_width / 2;
      }

      return {x: this.getAbsoluteX() + x, y: this.ys[index]};
    },

    // Pre-render formatting
    preFormat: function() {
      if (this.preFormatted) return;
      if (this.modifierContext) this.modifierContext.preFormat();
      // width is already set during init()
      this.setPreFormatted(true);
    },

    getStemX: function() {
      return this.getAbsoluteX() + this.x_shift + (this.glyph.head_width / 2);
    },

    getStemY: function(){
      // The decimal staff line amounts provide optimal spacing between the 
      // fret number and the stem
      var stemUpLine = -0.7;
      var stemDownLine = this.stave.options.num_lines - 0.3;
      var stemStartLine = Stem.UP === this.stem_direction ? stemUpLine : stemDownLine;

      return this.stave.getYForLine(stemStartLine);
    },

    getStemExtents: function() {
      var stem_base_y = this.getStemY();
      var stem_top_y = stem_base_y + (Stem.HEIGHT * -this.stem_direction);

      return { topY: stem_top_y , baseY: stem_base_y};
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "Can't draw note without Y values.");

      var ctx = this.context;
      var x = this.getAbsoluteX();
      var ys = this.ys;
      var y;

      var render_stem = this.beam == null && this.render_options.draw_stem;
      var render_flag = this.beam == null && render_stem;

      var i;
      for (i = 0; i < this.positions.length; ++i) {
        y = ys[i];

        var glyph = this.glyphs[i];

        // Center the fret text beneath the notation note head
        var note_glyph_width = this.glyph.head_width;
        var tab_x = x + (note_glyph_width / 2) - (glyph.width / 2);

        ctx.clearRect(tab_x - 2, y - 3, glyph.width + 4, 6);

        if (glyph.code) {
          Vex.Flow.renderGlyph(ctx, tab_x, y + 5 + glyph.shift_y,
              this.render_options.glyph_font_scale, glyph.code);
        } else {
          var text = glyph.text.toString();
          ctx.fillText(text, tab_x, y + 5);
        }
      }

      var stem_x = this.getStemX();
      var stem_y = this.getStemY();
      if (render_stem) {
        this.drawStem({
          x_begin: stem_x,
          x_end: stem_x,
          y_top: stem_y,
          y_bottom: stem_y,
          y_extend: 0,
          stem_extension: this.stem_extension,
          stem_direction: this.stem_direction
        });
      }

      // Now it's the flag's turn.
      if (this.glyph.flag && render_flag) {
        var flag_x = this.getStemX() + 1 ;
        var flag_y = this.getStemY() - (this.stem.getHeight());
        var flag_code;

        if (this.stem_direction == Stem.DOWN) {
          // Down stems have flags on the left.
          flag_code = this.glyph.code_flag_downstem;
        } else {
          // Up stems have flags on the left.
          flag_code = this.glyph.code_flag_upstem;
        }

        // Draw the Flag
        Vex.Flow.renderGlyph(ctx, flag_x, flag_y,
            this.render_options.glyph_font_scale, flag_code);
      }

      // Draw the modifiers
      this.modifiers.forEach(function(modifier) {
          // Only draw the dots if enabled
          if (modifier.getCategory() === 'dots' && !this.render_options.draw_dots) return;

          modifier.setContext(this.context);
          modifier.draw();
      }, this);
    }
  });

  return TabNote;
}());
