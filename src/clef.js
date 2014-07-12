// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
//
// ## Description
//
// This file implements various types of clefs that can be rendered on a stave.
//
// See `tests/clef_tests.js` for usage examples.

Vex.Flow.Clef = (function() {
  function Clef(clef) {
    if (arguments.length > 0) this.init(clef);
  }

  // To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`.
  function L() { if (Vex.Flow.Clef.DEBUG) Vex.L("Vex.Flow.Clef", arguments); }

  // Every clef name is associated with a glyph code from the font file, a
  // point size, and a default stave line number.
  Clef.types = {
    "treble": {
      code: "v83",
      point: 40,
      line: 3
    },
    "bass": {
      code: "v79",
      point: 40,
      line: 1
    },
    "alto": {
      code: "vad",
      point: 40,
      line: 2
    },
    "tenor": {
      code: "vad",
      point: 40,
      line: 1
    },
    "percussion": {
      code: "v59",
      point: 40,
      line: 2
    },
    "soprano": {
      code: "vad",
      point: 40,
      line: 4
    },
    "mezzo-soprano": {
      code: "vad",
      point: 40,
      line: 3
    },
    "baritone-c": {
      code: "vad",
      point: 40,
      line: 0
    },
    "baritone-f": {
      code: "v79",
      point: 40,
      line: 2
    },
    "subbass": {
      code: "v79",
      point: 40,
      line: 0
    },
    "french": {
      code: "v83",
      point: 40,
      line: 4
    },
    "treble_small": {
      code: "v83",
      point: 32,
      line: 3
    },
    "bass_small": {
      code: "v79",
      point: 32,
      line: 1
    },
    "alto_small": {
      code: "vad",
      point: 32,
      line: 2
    },
    "tenor_small": {
      code: "vad",
      point: 32,
      line: 1
    },
    "soprano_small": {
      code: "vad",
      point: 32,
      line: 4
    },
    "mezzo-soprano_small": {
      code: "vad",
      point: 32,
      line: 3
    },
    "baritone-c_small": {
      code: "vad",
      point: 32,
      line: 0
    },
    "baritone-f_small": {
      code: "v79",
      point: 32,
      line: 2
    },
    "subbass_small": {
      code: "v79",
      point: 32,
      line: 0
    },
    "french_small": {
      code: "v83",
      point: 32,
      line: 4
    },
    "percussion_small": {
      code: "v59",
      point: 32,
      line: 2
    }
  };

  // ## Prototype Methods
  Vex.Inherit(Clef, Vex.Flow.StaveModifier, {
    // Create a new clef. The parameter `clef` must be a key from
    // `Clef.types`.
    init: function(clef) {
      var superclass = Vex.Flow.Clef.superclass;
      superclass.init.call(this);

      this.clef = Vex.Flow.Clef.types[clef];
      L("Creating clef:", clef);
    },

    // Add this clef to the start of the given `stave`.
    addModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      stave.addGlyph(glyph);
    },

    // Add this clef to the end of the given `stave`.
    addEndModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      stave.addEndGlyph(glyph);
    }
  });

  return Clef;
}());
