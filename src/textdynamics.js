// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the `TextDynamics` which renders traditional
// text dynamics markings, **ie: p, f, sfz, rfz, ppp**
//
// You can render any dynamics string that contains a combination of
// the following letters:  P, M, F, Z, R, S
Vex.Flow.TextDynamics = (function(){
  function TextDynamics(text_struct) {
    if (arguments.length > 0) this.init(text_struct);
  }

  // To enable logging for this class. Set `Vex.Flow.TextDynamics.DEBUG` to `true`.
  function L() { if (TextDynamics.DEBUG) Vex.L("Vex.Flow.TextDynamics", arguments); }

  // The glyph data for each dynamics letter
  TextDynamics.GLYPHS = {
    "f": {
      code: "vba",
      width: 12
    },
    "p": {
      code: "vbf",
      width: 14
    },
    "m": {
      code: "v62",
      width: 17
    },
    "s": {
      code: "v4a",
      width: 10
    },
    "z": {
      code: "v80",
      width: 12
    },
    "r": {
      code: "vb1",
      width: 12
    }
  };

  // ## Prototype Methods
  //
  // A `TextDynamics` object inherits from `Note` so that it can be formatted
  // within a `Voice`.
  Vex.Inherit(TextDynamics, Vex.Flow.Note, {
    // Create the dynamics marking. `text_struct` is an object
    // that contains a `duration` property and a `sequence` of
    // letters that represents the letters to render
    init: function(text_struct) {
      TextDynamics.superclass.init.call(this, text_struct);

      this.sequence = text_struct.text.toLowerCase();
      this.line = text_struct.line || 0;
      this.glyphs = [];

      Vex.Merge(this.render_options, {
        glyph_font_size: 40
      });

      L("New Dynamics Text: ", this.sequence);
    },

    // Set the Stave line on which the note should be placed
    setLine: function(line) { this.line = line;  return this; },

    // Preformat the dynamics text
    preFormat: function() {
      var total_width = 0;
      // Iterate through each letter
      this.sequence.split('').forEach(function(letter) {
        // Get the glyph data for the letter
        var glyph_data = TextDynamics.GLYPHS[letter];
        if (!glyph_data) throw new Vex.RERR("Invalid dynamics character: " + letter);

        var size =  this.render_options.glyph_font_size;
        var glyph = new Vex.Flow.Glyph(glyph_data.code, size);

        // Add the glyph
        this.glyphs.push(glyph);

        total_width += glyph_data.width;
      }, this);

      // Store the width of the text
      this.setWidth(total_width);
      this.preFormatted = true;
      return this;
    },

    // Draw the dynamics text on the rendering context
    draw: function() {
      var x = this.getAbsoluteX();
      var y = this.stave.getYForLine(this.line + (-3));

      L("Rendering Dynamics: ", this.sequence);

      var letter_x = x;
      this.glyphs.forEach(function(glyph, index) {
        var current_letter = this.sequence[index];
        glyph.render(this.context, letter_x, y);
        letter_x += TextDynamics.GLYPHS[current_letter].width;
      }, this);
    }
  });

  return TextDynamics;
})();