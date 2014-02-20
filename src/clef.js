// Vex Flow Notation.
// Copyright Mohit Muthanna Cheppudira 2013.
// Implements clefs.

Vex.Flow.Clef = (function() {
  function Clef(clef) {
    if (arguments.length > 0) this.init(clef);
  }

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
    "percussion_small": {
      code: "v59",
      point: 32,
      line: 2
    }
  };

  Vex.Inherit(Clef, Vex.Flow.StaveModifier, {
    init: function(clef) {
      var superclass = Vex.Flow.Clef.superclass;
      superclass.init.call(this);

      this.clef = Vex.Flow.Clef.types[clef];
    },

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