// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
//
// ## Description
//
// This file implements key signatures. A key signature sits on a stave
// and indicates the notes with implicit accidentals.
Vex.Flow.KeySignature = (function() {
  function KeySignature(keySpec, cancelKeySpec, alterKeySpec) {
    if (arguments.length > 0) this.init(keySpec, cancelKeySpec, alterKeySpec);
  }

  KeySignature.category = 'keysignatures';

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
    },
    '##': {
      above: 6,
      below: 4
    },
    'bb': {
      above: 4,
      below: 7
    },
    'db': {
      above: 4,
      below: 7
    },
    'd': {
      above: 4,
      below: 7
    },
    'bbs': {
      above: 4,
      below: 7
    },
    '++': {
      above: 6,
      below: 4
    },
    '+': {
      above: 6,
      below: 4
    },
    '+-': {
      above: 6,
      below: 4
    },
    '++-': {
      above: 6,
      below: 4
    },
    'bs': {
      above: 4,
      below: 10
    },
    'bss': {
      above: 4,
      below: 10
    }
  };

  // ## Prototype Methods
  Vex.Inherit(KeySignature, Vex.Flow.StaveModifier, {
    // Create a new Key Signature based on a `key_spec`
    init: function(keySpec, cancelKeySpec, alterKeySpec) {
      KeySignature.superclass.init();

      this.setKeySig(keySpec, cancelKeySpec, alterKeySpec);
      this.setPosition(Vex.Flow.StaveModifier.Position.BEGIN);
      this.glyphFontScale = 38; // TODO(0xFE): Should this match StaveNote?
      this.glyphs = [];
      this.paddingForced = false;
    },

    getCategory: function() { return KeySignature.category; },

    // Add an accidental glyph to the `stave`. `acc` is the data of the
    // accidental to add. If the `next` accidental is also provided, extra
    // width will be added to the initial accidental for optimal spacing.
    convertToGlyph: function(acc, next) {
      var glyph_data = Vex.Flow.accidentalCodes(acc.type);
      var glyph = new Vex.Flow.Glyph(glyph_data.code, this.glyphFontScale);

      // Determine spacing between current accidental and the next accidental
      var extra_width = 0;
      if (acc.type === "n" && next) {
        var above = next.line >= acc.line;
        var space = KeySignature.accidentalSpacing[next.type];
        if (space) {
          extra_width = above ? space.above : space.below;
        }
      }

      var glyph_width = glyph_data.width + extra_width;
      this.width += glyph_width;
      // Set the width and place the glyph on the stave
      glyph.setWidth(glyph_width);
      this.placeGlyphOnLine(glyph, this.stave, acc.line);
      this.glyphs.push(glyph);
    },

    // Cancel out a key signature provided in the `spec` parameter. This will
    // place appropriate natural accidentals before the key signature.
    cancelKey: function(spec) {
      this.formatted = false;
      this.cancelKeySpec = spec;

      return this;
    },

    convertToCancelAccList: function(spec) {
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
    },

    // Deprecated
    addToStave: function(stave, firstGlyph) {
      this.paddingForced = true;
      stave.addModifier(this);

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
    },

    getPadding: function(index) {
      if (!this.formatted) this.format();

      return (
        this.glyphs.length === 0 || (!this.paddingForced && index < 2) ?
          0 : this.padding
      );
    },

    getWidth: function() {
      if (!this.formatted) this.format();

      return this.width;
    },

    setKeySig: function(keySpec, cancelKeySpec, alterKeySpec) {
      this.formatted = false;
      this.keySpec = keySpec;
      this.cancelKeySpec = cancelKeySpec;
      this.alterKeySpec = alterKeySpec;

      return this;
    },

    // Alter the accidentals of a key spec one by one.
    // Each alteration is a new accidental that replaces the
    // original accidental (or the canceled one).
    alterKey: function(alterKeySpec) {
      this.formatted = false;
      this.alterKeySpec = alterKeySpec;

      return this;
    },

    convertToAlterAccList: function(alterKeySpec) {
      var max = Math.min(alterKeySpec.length, this.accList.length);
      for (var i = 0; i < max; ++i) {
        if (alterKeySpec[i]) {
          this.accList[i].type = alterKeySpec[i];
        }
      }
    },

    format: function() {
      if (!this.stave) throw new Vex.RERR("KeySignatureError", "Can't draw key signature without stave.");

      this.width = 0;
      this.glyphs = [];
      this.accList = Vex.Flow.keySignature(this.keySpec);
      if (this.cancelKeySpec) {
        this.convertToCancelAccList(this.cancelKeySpec);
      }
      var firstAccidentalType = this.accList.length > 0 ? this.accList[0].type : null;
      if (this.alterKeySpec) {
        this.convertToAlterAccList(this.alterKeySpec);
      }

      if (this.accList.length > 0) {
        this.convertAccLines(this.stave.clef, firstAccidentalType);
        for (var i = 0; i < this.accList.length; ++i) {
          this.convertToGlyph(this.accList[i], this.accList[i+1]);
        }
      }

      this.formatted = true;
    },

    draw: function() {
      if (!this.x) throw new Vex.RERR("KeySignatureError", "Can't draw key signature without x.");
      if (!this.stave) throw new Vex.RERR("KeySignatureError", "Can't draw key signature without stave.");
      if (!this.formatted) this.format();

      var x = this.x;
      for (var i = 0; i < this.glyphs.length; i++) {
        var glyph = this.glyphs[i];
        glyph.setStave(this.stave);
        glyph.setContext(this.stave.context);
        glyph.renderToStave(x);
        x += glyph.getMetrics().width;
      }
    }
  });

  return KeySignature;
}());
