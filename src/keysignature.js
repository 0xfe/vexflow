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

    addAccToStave: function(stave, acc, next) {
      var glyph_data = Vex.Flow.accidentalCodes(acc.type);
      var glyph = new Vex.Flow.Glyph(glyph_data.code, this.glyphFontScale);

      var extra_width = 0;
      if (next && next.type === "n" && acc.type === "#" && next.line > acc.line) {
        extra_width = 3;
      } else if (next && next.type === "n" && acc.type === "#" && next.line < acc.line) {
        extra_width = -2;
      }

      if (next && next.type === "b" && acc.type === "n" && next.line > acc.line) {
        extra_width = 4;
      } else if (next && next.type === "b" && acc.type === "n" && next.line < acc.line) {
        extra_width = 4;
      }
      if (next && next.type === "#" && acc.type === "n" && next.line > acc.line) {
        extra_width = 0;
      } else if (next && next.type === "#" && acc.type === "n" && next.line < acc.line) {
        extra_width = 3;
      }

      if (next && next.type === "n" && acc.type === "#" && next.line > acc.line) {
        extra_width = 3;
      } else if (next && next.type === "n" && acc.type === "#" && next.line < acc.line) {
        extra_width = 2;
      }

      if (next && next.type === "n" && acc.type === "n" && next.line < acc.line) {
        extra_width = -2;
      } else if (next && next.type === "n" && acc.type === "n" && next.line > acc.line) {
        extra_width = 3;
      }

      glyph.setWidth(glyph_data.width + extra_width);
      this.placeGlyphOnLine(glyph, stave, acc.line);
      stave.addGlyph(glyph);
    },

    cancelKey: function(spec) {
      // Get the accidental list for the cancelled key signature
      var cancel_accList = Vex.Flow.keySignature(spec);

      // If the cancelled key has a different accidental type, ie: # vs b
      var different_types = this.accList.length > 0 &&
                            cancel_accList[0].type !== this.accList[0].type;

      // Determine how many naturals needed to add
      var naturals = 0;
      if (different_types) {
        naturals = Math.min(Math.abs(this.accList.length - 7), cancel_accList.length);
      } else {
        naturals = cancel_accList.length - this.accList.length;
      }

      // Return if no naturals needed
      if (naturals < 1) return;

      // Get the line position for each natural
      var cancelled = [];
      for (var i = 0; i < naturals; i++) {
        var index = i;
        if (!different_types) {
          index = cancel_accList.length - naturals + i;
        }

        var acc = cancel_accList[index];
        cancelled.push({type: "n", line: acc.line});
      }

      // Combine naturals with main accidental list for the key signature
      if (different_types) {
        this.accList = cancelled.concat(this.accList);
      } else {
        this.accList = this.accList.concat(cancelled);
      }

      return this;
    },

    addModifier: function(stave) {
      this.convertAccLines(stave.clef, this.accList[0].type);
      for (var i = 0; i < this.accList.length; ++i) {
        this.addAccToStave(stave, this.accList[i], this.accList[i+1]);
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

    convertAccLines: function(clef, type) {
      var offset = 0.0; // if clef === "treble"
      var tenorSharps;
      var isTenorSharps = ((clef === "tenor") && (type === "#")) ? true : false;

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