// Vex Flow Notation.
// Copyright Mohit Muthanna Cheppudira 2013.
// Implements clefs.
// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
// ## Description
//
// This file implements clefs
//
// See `tests/clef_tests.js` for usage examples.

Vex.Flow.Clef = (function() {
  function Clef(clef) {
    if (arguments.length > 0) this.init(clef);
  }
  
  // To enable logging for this class. Set `Vex.Flow.Clef.DEBUG` to `true`.
  function L() { if (Vex.Flow.Clef.DEBUG) Vex.L("Vex.Flow.Clef", arguments); }


  // defined clefs are
  //treble
  Clef.types = {
    "treble": {
      code: "v83",
      point: 40,
      line: 3
    },
    //bass
    "bass": {
      code: "v79",
      point: 40,
      line: 1
    },
    //alto
    "alto": {
      code: "vad",
      point: 40,
      line: 2
    },
    //tenor
    "tenor": {
      code: "vad",
      point: 40,
      line: 1
    },
    //percussion
    "percussion": {
      code: "v59",
      point: 40,
      line: 2
    },
    //soprano
    "soprano": {
      code: "vad",
      point: 40,
      line: 4
    },
    //mezzo-soprano
    "mezzo-soprano": {
      code: "vad",
      point: 40,
      line: 3
    },
    //bariton-c
    "baritone-c": {
      code: "vad",
      point: 40,
      line: 0
    },
    //baritone-f
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
    //french
    "french": {
      code: "v83",
      point: 40,
      line: 4
    },
    //all of which are also defined in a smaller version
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
  //
  // A `Clef` inherits from `StaveModifier`
  Vex.Inherit(Clef, Vex.Flow.StaveModifier, {
    init: function(clef) {
      var superclass = Vex.Flow.Clef.superclass;
      superclass.init.call(this);

      this.clef = Vex.Flow.Clef.types[clef];
    },
    //a clef adds a line_shift modifier to a stave.
    //the individual line shift of each clef is defined in tables.js
    addModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      stave.addGlyph(glyph);
    },

    addEndModifier: function(stave) {
      var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
      stave.addEndGlyph(glyph);
    }
  });

  return Clef;
}());