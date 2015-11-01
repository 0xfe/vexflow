// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// The file implements notes for Tablature notation. This consists of one or
// more fret positions, and can either be drawn with or without stems.
//
// See `tests/tabnote_tests.js` for usage examples
Vex.Flow.TabNote = (function() {
  function TabNote(tab_struct, draw_stem) {
    if (arguments.length > 0) this.init(tab_struct, draw_stem);
  }

  var Stem = Vex.Flow.Stem;

  // ## Prototype Methods
  Vex.Inherit(TabNote, Vex.Flow.StemmableNote, {
    // Initialize the TabNote with a `tab_struct` full of properties
    // and whether to `draw_stem` when rendering the note
    init: function(tab_struct, draw_stem) {
      var superclass = Vex.Flow.TabNote.superclass;
      superclass.init.call(this, tab_struct);

      this.ghost = false; // Renders parenthesis around notes
      // Note properties
      //
      // The fret positions in the note. An array of `{ str: X, fret: X }`
      this.positions = tab_struct.positions;

      // Render Options
      Vex.Merge(this.render_options, {
        // font size for note heads and rests
        glyph_font_scale: 30,
        // Flag to draw a stem
        draw_stem: draw_stem,
        // Flag to draw dot modifiers
        draw_dots: draw_stem,
        // Flag to extend the main stem through the stave and fret positions
        draw_stem_through_stave: false
      });

      this.glyph =
        Vex.Flow.durationToGlyph(this.duration, this.noteType);
      if (!this.glyph) {
        throw new Vex.RuntimeError("BadArguments",
            "Invalid note initialization data (No glyph found): " +
            JSON.stringify(tab_struct));
      }

      this.buildStem();

      if (tab_struct.stem_direction){
        this.setStemDirection(tab_struct.stem_direction);
      } else {
        this.setStemDirection(Stem.UP);
      }

      // Renders parenthesis around notes
      this.ghost = false;
      this.updateWidth();
    },

    // The ModifierContext category
    getCategory: function() { return "tabnotes"; },

    // Set as ghost `TabNote`, surrounds the fret positions with parenthesis.
    // Often used for indicating frets that are being bent to
    setGhost: function(ghost) {
      this.ghost = ghost;
      this.updateWidth();
      return this;
    },

    // Determine if the note has a stem
    hasStem: function() { return this.render_options.draw_stem; },

    // Get the default stem extension for the note
    getStemExtension: function(){
      var glyph = this.getGlyph();

      if (this.stem_extension_override != null) {
        return this.stem_extension_override;
      }

      if (glyph) {
        return this.getStemDirection() === 1 ? glyph.tabnote_stem_up_extension :
          glyph.tabnote_stem_down_extension;
      }

      return 0;
    },

    // Add a dot to the note
    addDot: function() {
      var dot = new Vex.Flow.Dot();
      this.dots++;
      return this.addModifier(dot, 0);
    },

    // Calculate and store the width of the note
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

    // Set the `stave` to the note
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

    // Get the fret positions for the note
    getPositions: function() { return this.positions; },

    // Add self to the provided modifier context `mc`
    addToModifierContext: function(mc) {
      this.setModifierContext(mc);
      for (var i = 0; i < this.modifiers.length; ++i) {
        this.modifierContext.addModifier(this.modifiers[i]);
      }
      this.modifierContext.addModifier(this);
      this.preFormatted = false;
      return this;
    },

    // Get the `x` coordinate to the right of the note
    getTieRightX: function() {
      var tieStartX = this.getAbsoluteX();
      var note_glyph_width = this.glyph.head_width;
      tieStartX += (note_glyph_width / 2);
      tieStartX += ((-this.width / 2) + this.width + 2);

      return tieStartX;
    },

    // Get the `x` coordinate to the left of the note
    getTieLeftX: function() {
      var tieEndX = this.getAbsoluteX();
      var note_glyph_width = this.glyph.head_width;
      tieEndX += (note_glyph_width / 2);
      tieEndX -= ((this.width / 2) + 2);

      return tieEndX;
    },

    // Get the default `x` and `y` coordinates for a modifier at a specific
    // `position` at a fret position `index`
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

    // Get the default line for rest
    getLineForRest: function() { return this.positions[0].str; },

    // Pre-render formatting
    preFormat: function() {
      if (this.preFormatted) return;
      if (this.modifierContext) this.modifierContext.preFormat();
      // width is already set during init()
      this.setPreFormatted(true);
    },

    // Get the x position for the stem
    getStemX: function() { return this.getCenterGlyphX(); },

    // Get the y position for the stem
    getStemY: function(){
      var num_lines = this.stave.getNumLines();

      // The decimal staff line amounts provide optimal spacing between the
      // fret number and the stem
      var stemUpLine = -0.5;
      var stemDownLine = num_lines - 0.5;
      var stemStartLine = Stem.UP === this.stem_direction ? stemUpLine : stemDownLine;

      return this.stave.getYForLine(stemStartLine);
    },

    // Get the stem extents for the tabnote
    getStemExtents: function() {
      var stem_base_y = this.getStemY();
      var stem_top_y = stem_base_y + (Stem.HEIGHT * -this.stem_direction);

      return { topY: stem_top_y , baseY: stem_base_y};
    },

    // Draw the fal onto the context
    drawFlag: function() {
      var render_stem = this.beam == null && this.render_options.draw_stem;
      var render_flag = this.beam == null && render_stem;

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
        Vex.Flow.renderGlyph(this.context, flag_x, flag_y,
            this.render_options.glyph_font_scale, flag_code);
      }
    },

    // Render the modifiers onto the context
    drawModifiers: function() {
      // Draw the modifiers
      this.modifiers.forEach(function(modifier) {
        // Only draw the dots if enabled
        if (modifier.getCategory() === 'dots' && !this.render_options.draw_dots) return;

        modifier.setContext(this.context);
        modifier.draw();
      }, this);
    },

    // Render the stem extension through the fret positions
    drawStemThrough: function() {
      var stem_x = this.getStemX();
      var stem_y = this.getStemY();
      var ctx = this.context;

      var stem_through = this.render_options.draw_stem_through_stave;
      var draw_stem = this.render_options.draw_stem;
      if (draw_stem && stem_through) {
        var total_lines = this.stave.getNumLines();
        var strings_used = this.positions.map(function(position) {
          return position.str;
        });

        var unused_strings = getUnusedStringGroups(total_lines, strings_used);
        var stem_lines = getPartialStemLines(stem_y, unused_strings,
                              this.getStave(), this.getStemDirection());

        // Fine tune x position to match default stem
        if (!this.beam || this.getStemDirection() === 1) {
          stem_x += (Stem.WIDTH / 2);
        }

        ctx.save();
        ctx.setLineWidth(Stem.WIDTH);
        stem_lines.forEach(function(bounds) {
          if (bounds.length === 0) return;

          ctx.beginPath();
          ctx.moveTo(stem_x, bounds[0]);
          ctx.lineTo(stem_x, bounds[bounds.length - 1]);
          ctx.stroke();
          ctx.closePath();
        });
        ctx.restore();
      }
    },

    // Render the fret positions onto the context
    drawPositions: function() {
      var ctx = this.context;
      var x = this.getAbsoluteX();
      var ys = this.ys;
      var y;

      for (var i = 0; i < this.positions.length; ++i) {
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
    },

    // The main rendering function for the entire note
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "Can't draw note without Y values.");

      var render_stem = this.beam == null && this.render_options.draw_stem;

      this.drawPositions();
      this.drawStemThrough();

      var stem_x = this.getStemX();
      var stem_y = this.getStemY();
      if (render_stem) {
        this.drawStem({
          x_begin: stem_x,
          x_end: stem_x,
          y_top: stem_y,
          y_bottom: stem_y,
          y_extend: 0,
          stem_extension: this.getStemExtension(),
          stem_direction: this.stem_direction
        });
      }

      this.drawFlag();
      this.drawModifiers();
    }
  });

  // ## Private Helpers
  //
  // Gets the unused strings grouped together if consecutive.
  //
  // Parameters:
  // * num_lines - The number of lines
  // * strings_used - An array of numbers representing which strings have fret positions
  function getUnusedStringGroups(num_lines, strings_used) {
    var stem_through = [];
    var group = [];
    for (var string = 1; string <= num_lines ; string++) {
      var is_used = strings_used.indexOf(string) > -1;

      if (!is_used) {
        group.push(string);
      } else {
        stem_through.push(group);
        group = [];
      }
    }
    if (group.length > 0) stem_through.push(group);

    return stem_through;
  }

  // Gets groups of points that outline the partial stem lines
  // between fret positions
  //
  // Parameters:
  // * stem_Y - The `y` coordinate the stem is located on
  // * unused_strings - An array of groups of unused strings
  // * stave - The stave to use for reference
  // * stem_direction - The direction of the stem
  function getPartialStemLines (stem_y, unused_strings, stave, stem_direction) {
    var up_stem = stem_direction !== 1;
    var down_stem = stem_direction !== -1;

    var line_spacing = stave.getSpacingBetweenLines();
    var total_lines = stave.getNumLines();

    var stem_lines = [];

    unused_strings.forEach(function(strings) {
      var containsLastString = strings.indexOf(total_lines) > -1;
      var containsFirstString =  strings.indexOf(1) > -1;

      if ((up_stem && containsFirstString) ||
         (down_stem && containsLastString)) {
        return;
      }

      // If there's only one string in the group, push a duplicate value.
      // We do this because we need 2 strings to convert into upper/lower y
      // values.
      if (strings.length === 1) {
        strings.push(strings[0]);
      }

      var line_ys = [];
      // Iterate through each group string and store it's y position
      strings.forEach(function(string, index, strings) {
        var isTopBound = string === 1;
        var isBottomBound = string === total_lines;

        // Get the y value for the appropriate staff line,
        // we adjust for a 0 index array, since string numbers are index 1
        var y = stave.getYForLine(string - 1);

        // Unless the string is the first or last, add padding to each side
        // of the line
        if (index === 0 && !isTopBound) {
          y -= line_spacing/2 - 1;
        } else if (index === strings.length - 1 && !isBottomBound){
          y += line_spacing/2 - 1;
        }

        // Store the y value
        line_ys.push(y);

        // Store a subsequent y value connecting this group to the main
        // stem above/below the stave if it's the top/bottom string
        if (stem_direction === 1 && isTopBound) {
          line_ys.push(stem_y - 2);
        } else if (stem_direction === -1 && isBottomBound) {
          line_ys.push(stem_y + 2);
        }
      });

      // Add the sorted y values to the
      stem_lines.push(line_ys.sort(function(a, b) {
        return a - b;
      }));
    });

    return stem_lines;
  }

  return TabNote;
}());
