// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
//
// ## Description
//
// This file implements key signatures. A key signature sits on a stave
// and indicates the notes with implicit accidentals.
Vex.Flow.KeySignature = (function() {
  function KeySignature(keySpec) {
    if (arguments.length > 0) this.init(keySpec);
  }

  // Space between natural and following accidental depending
  // on vertical position
  KeySignature.accidentalSpacing = {
    '#': {
      above: 6,
      below: 4
    },
    'b': {
      above: 4,
      below: 7
    },
    'n': {
      above: 3,
      below: -1
    }
  };

  // ## Prototype Methods
  Vex.Inherit(KeySignature, Vex.Flow.StaveModifier, {
    // Create a new Key Signature based on a `key_spec`
    init: function(key_spec) {
      KeySignature.superclass.init();

      this.glyphFontScale = 38; // TODO(0xFE): Should this match StaveNote?
      this.accList = Vex.Flow.keySignature(key_spec);
    },

    // Add an accidental glyph to the `stave`. `acc` is the data of the
    // accidental to add. If the `next` accidental is also provided, extra
    // width will be added to the initial accidental for optimal spacing.
    addAccToStave: function(stave, acc, next) {
      var glyph_data = Vex.Flow.accidentalCodes(acc.type);
      var glyph = new Vex.Flow.Glyph(glyph_data.code, this.glyphFontScale);

      // Determine spacing between current accidental and the next accidental
      var extra_width = 0;
      if (acc.type === "n" && next) {
        var above = next.line >= acc.line;
        var space = KeySignature.accidentalSpacing[next.type];
        extra_width = above ? space.above : space.below;
      }

      // Set the width and place the glyph on the stave
      glyph.setWidth(glyph_data.width + extra_width);
      this.placeGlyphOnLine(glyph, stave, acc.line);
      stave.addGlyph(glyph);
    },

    // Cancel out a key signature provided in the `spec` parameter. This will
    // place appropriate natural accidentals before the key signature.
    cancelKey: function(spec) {
      // Get the accidental list for the cancelled key signature
      var cancel_accList = Vex.Flow.keySignature(spec);

      // If the cancelled key has a different accidental type, ie: # vs b
      var different_types = this.accList.length > 0 &&
                            cancel_accList[0].type !== this.accList[0].type;

      // Determine how many naturals needed to add
      var naturals = 0;
      if (different_types) {
        naturals = cancel_accList.length;
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
      this.accList = cancelled.concat(this.accList);

      return this;
    },

    // Add the key signature to the `stave`. You probably want to use the 
    // helper method `.addToStave()` instead
    addModifier: function(stave) {
      this.convertAccLines(stave.clef, this.accList[0].type);
      for (var i = 0; i < this.accList.length; ++i) {
        this.addAccToStave(stave, this.accList[i], this.accList[i+1]);
      }
    },

    // Add the key signature to the `stave`, if it's the not the `firstGlyph`
    // a spacer will be added as well.
    addToStave: function(stave, firstGlyph) {
      if (this.accList.length === 0)
        return this;

      if (!firstGlyph) {
        stave.addGlyph(this.makeSpacer(this.padding));
      }

      this.addModifier(stave);
      return this;
    },

    // Apply the accidental staff line placement based on the `clef` and
    // the  accidental `type` for the key signature ('# or 'b').
    convertAccLines: function(clef, type) {
      var offset = 0.0; // if clef === "treble"
      var customLines; // when clef doesn't follow treble key sig shape

      switch (clef) {
        // Treble & Subbass both have offsets of 0, so are not included.
        case "soprano":
          if(type === "#") customLines = [2.5,0.5,2,0,1.5,-0.5,1];
          else offset = -1;
          break;
        case "mezzo-soprano":
          if(type === "b") customLines = [0,2,0.5,2.5,1,3,1.5];
          else offset = 1.5;
          break;
        case "alto":
          offset = 0.5;
          break;
        case "tenor":
          if(type === "#") customLines = [3, 1, 2.5, 0.5, 2, 0, 1.5];
          else offset = -0.5;
          break;
        case "baritone-f":
        case "baritone-c":
          if(type === "b") customLines = [0.5,2.5,1,3,1.5,3.5,2];
          else offset = 2;
          break;
        case "bass":
        case "french":
          offset = 1;
          break;
      }

      // If there's a special case, assign those lines/spaces:
      var i;
      if (typeof customLines !== "undefined") {
        for (i = 0; i < this.accList.length; ++i) {
          this.accList[i].line = customLines[i];
        }
      } else if (offset !== 0) {
        for (i = 0; i < this.accList.length; ++i) {
          this.accList[i].line += offset;
        }
      }
    }
  });

  return KeySignature;
}());