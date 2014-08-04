// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements different types of pedal markings. These notation
// elements indicate to the performer when to depress and release the a pedal.
//
// In order to create "Sostenuto", and "una corda" markings, you must set
// custom text for the release/depress pedal markings.
Vex.Flow.PedalMarking = (function() {
  function PedalMarking(type) {
    if (arguments.length > 0) this.init(type);
  }

  // To enable logging for this class. Set `Vex.Flow.PedalMarking.DEBUG` to `true`.
  function L() { if (PedalMarking.DEBUG) Vex.L("Vex.Flow.PedalMarking", arguments); }

  // Glyph data
  PedalMarking.GLYPHS = {
    "pedal_depress": {
      code: "v36",
      x_shift:-10,
      y_shift:0
    },
    "pedal_release": {
      code: "v5d",
      x_shift:-2,
      y_shift:3
    },
  };

  PedalMarking.Styles = {
    TEXT: 1,
    BRACKET: 2,
    MIXED: 3
  };


  // ## Public helpers
  //
  // Create a sustain pedal marking. Returns the defaults PedalMarking.
  // Which uses the traditional "Ped" and "*"" markings.
  PedalMarking.createSustain = function(notes) {
    var pedal = new PedalMarking(notes);
    return pedal;
  };

  // Create a sostenuto pedal marking
  PedalMarking.createSostenuto = function(notes) {
    var pedal = new PedalMarking(notes);
    pedal.setStyle(PedalMarking.Styles.MIXED);
    pedal.setCustomText("Sost. Ped.");
    return pedal;
  };

  // Create an una corda pedal marking
  PedalMarking.createUnaCorda = function(notes){
    var pedal = new PedalMarking(notes);
    pedal.setStyle(PedalMarking.Styles.TEXT);
    pedal.setCustomText("una corda", "tre corda");
    return pedal;
  };

  // ## Prototype Methods
  PedalMarking.prototype =  {
    init: function(notes) {
      this.notes = notes;
      this.style = Vex.Flow.PedalMarking.TEXT;
      this.line = 0;

      // Custom text for the release/depress markings
      this.custom_depress_text = "";
      this.custom_release_text = "";

      this.font = {
        family: "Times New Roman",
        size: 12,
        weight: "italic bold"
      };

      this.render_options = {
        bracket_height: 10,
        text_margin_right: 6,
        bracket_line_width: 1,
        glyph_point_size: 40,
        color: "black"
      };
    },

    // Set custom text for the `depress`/`release` pedal markings. No text is
    // set if the parameter is falsy.
    setCustomText: function(depress, release) {
      this.custom_depress_text = depress || "";
      this.custom_release_text = release || "";
      return this;
    },

    // Set the pedal marking style
    setStyle: function(style){
      if (style < 1 && style > 3)  {
        throw new Vex.RERR("InvalidParameter",
          "The style must be one found in PedalMarking.Styles");
      }

      this.style = style;
      return this;
    },

    // Set the staff line to render the markings on
    setLine: function(line) { this.line = line; return this; },

    // Set the rendering context
    setContext: function(context) { this.context = context; return this; },

    // Draw the bracket based pedal markings
    drawBracketed: function() {
      var ctx = this.context;
      var is_pedal_depressed = false;
      var prev_x;
      var prev_y;
      var pedal = this;

      // Iterate through each note
      this.notes.forEach(function(note, index, notes) {
        // Each note triggers the opposite pedal action
        is_pedal_depressed = !is_pedal_depressed;

        // Get the initial coordinates for the note
        var x = note.getAbsoluteX();
        var y = note.getStave().getYForBottomText(pedal.line + 3);

        // Throw if current note is positioned before the previous note
        if (x < prev_x) throw new Vex.RERR('InvalidConfiguration',
          'The notes provided must be in order of ascending x positions');

        // Determine if the previous or next note are the same
        // as the current note. We need to keep track of this for
        // when adjustments are made for the release+depress action
        var next_is_same = notes[index+1] === note;
        var prev_is_same = notes[index-1] === note;

        var x_shift = 0;
        if (is_pedal_depressed) {
          // Adjustment for release+depress
          x_shift =  prev_is_same ? 5 : 0;

          if (pedal.style === PedalMarking.Styles.MIXED && !prev_is_same) {
            // For MIXED style, start with text instead of bracket
            if (pedal.custom_depress_text) {
              // If we have custom text, use instead of the default "Ped" glyph
              var text_width = ctx.measureText(pedal.custom_depress_text).width;
              ctx.fillText(pedal.custom_depress_text, x - (text_width/2), y);
              x_shift = (text_width / 2) + pedal.render_options.text_margin_right;
            } else {
              // Render the Ped glyph in position
              drawPedalGlyph('pedal_depress', ctx, x, y, pedal.render_options.glyph_point_size);
              x_shift = 20 + pedal.render_options.text_margin_right;
            }
          } else {
            // Draw start bracket
            ctx.beginPath();
            ctx.moveTo(x, y - pedal.render_options.bracket_height);
            ctx.lineTo(x + x_shift, y);
            ctx.stroke();
            ctx.closePath();
          }
        } else {
          // Adjustment for release+depress
          x_shift = next_is_same ? -5 : 0;

          // Draw end bracket
          ctx.beginPath();
          ctx.moveTo(prev_x, prev_y);
          ctx.lineTo(x + x_shift, y);
          ctx.lineTo(x, y - pedal.render_options.bracket_height);
          ctx.stroke();
          ctx.closePath();
        }

        // Store previous coordinates
        prev_x = x + x_shift;
        prev_y = y;
      });
    },

    // Draw the text based pedal markings. This defaults to the traditional
    // "Ped" and "*"" symbols if no custom text has been provided.
    drawText: function() {
      var ctx = this.context;
      var is_pedal_depressed = false;
      var pedal = this;

      // The glyph point size
      var point = pedal.render_options.glyph_point_size;

      // Iterate through each note, placing glyphs or custom text accordingly
      this.notes.forEach(function(note) {
        is_pedal_depressed = !is_pedal_depressed;
        var stave = note.getStave();
        var x = note.getAbsoluteX();
        var y = stave.getYForBottomText(pedal.line + 3);

        var text_width = 0;
        if (is_pedal_depressed) {
          if (pedal.custom_depress_text) {
            text_width = ctx.measureText(pedal.custom_depress_text).width;
            ctx.fillText(pedal.custom_depress_text, x - (text_width/2), y);
          } else {
            drawPedalGlyph("pedal_depress", ctx, x, y, point);
          }
        } else {
          if (pedal.custom_release_text) {
            text_width = ctx.measureText(pedal.custom_release_text).width;
            ctx.fillText(pedal.custom_release_text, x - (text_width/2), y);
          } else {
            drawPedalGlyph("pedal_release", ctx, x, y, point);
          }
        }
      });
    },

    // Render the pedal marking in position on the rendering context 
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw PedalMarking without a context.");
      var ctx = this.context;

      ctx.save();
      ctx.setStrokeStyle(this.render_options.color);
      ctx.setFillStyle(this.render_options.color);
      ctx.setFont(this.font.family, this.font.size, this.font.weight);

      L("Rendering Pedal Marking");

      if (this.style === PedalMarking.Styles.BRACKET ||
          this.style === PedalMarking.Styles.MIXED) {
        ctx.setLineWidth(this.render_options.bracket_line_width);
        this.drawBracketed();
      } else if (this.style === Vex.Flow.PedalMarking.Styles.TEXT) {
        this.drawText();
      }

      ctx.restore();
    }
  };

  // ## Private Helper
  // 
  // Draws a pedal glyph with the provided `name` on a rendering `context` 
  // at the coordinates `x` and `y. Takes into account the glyph data
  // coordinate shifts.
  function drawPedalGlyph(name, context, x, y, point) {
    var glyph_data = PedalMarking.GLYPHS[name];
    var glyph = new Vex.Flow.Glyph(glyph_data.code, point);
    glyph.render(context, x + glyph_data.x_shift, y + glyph_data.y_shift);
  }

  return PedalMarking;
}());