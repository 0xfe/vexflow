// Vex Flow Notation
// Implements key signatures
//
// Requires vex.js.

/**
 * @constructor
 */
Vex.Flow.KeySignature = (function() {
  function KeySignature(keySpec) {
    if (arguments.length > 0) this.init(keySpec);
  }

  Vex.Inherit(KeySignature, Vex.Flow.StaveModifier, {
    init: function(key_spec) {
      KeySignature.superclass.init();

      this.glyphFontScale = 38; // TODO(0xFE): Should this match StaveNote?
      this.accList = Vex.Flow.keySignature(key_spec);
    },

    addAccToStave: function(stave, acc) {
      var glyph = new Vex.Flow.Glyph(acc.glyphCode, this.glyphFontScale);
      this.placeGlyphOnLine(glyph, stave, acc.line);
      stave.addGlyph(glyph);
    },

    addModifier: function(stave) {
      this.convertAccLines(stave.clef, this.accList[0].glyphCode);
      for (var i = 0; i < this.accList.length; ++i) {
        this.addAccToStave(stave, this.accList[i]);
      }
    },

    addToStave: function(stave, firstGlyph) {
      if (this.accList.length === 0)
        return this;

      if (!firstGlyph) {
        stave.addGlyph(this.makeSpacer(this.padding));
      }

      this.addModifier(stave);
      return this;
    },

    convertAccLines: function(clef, code) {
      var offset = 0.0; // if clef === "treble"
      var tenorSharps;
      var isTenorSharps = ((clef === "tenor") && (code === "v18")) ? true : false;

      switch (clef) {
        case "bass":
          offset = 1;
          break;
        case "alto":
          offset = 0.5;
          break;
        case "tenor":
          if (!isTenorSharps) {
            offset = -0.5;
          }
          break;
      }

      // Special-case for TenorSharps
      var i;
      if (isTenorSharps) {
        tenorSharps = [3, 1, 2.5, 0.5, 2, 0, 1.5];
        for (i = 0; i < this.accList.length; ++i) {
          this.accList[i].line = tenorSharps[i];
        }
      }
      else {
        if (clef != "treble") {
          for (i = 0; i < this.accList.length; ++i) {
            this.accList[i].line += offset;
          }
        }
      }
    }
  });

  return KeySignature;
}());