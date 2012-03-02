// Vex Flow Notation
// Implements key signatures
//
// Requires vex.js.

/**
 * @constructor
 */
Vex.Flow.KeySignature = function(keySpec) {
  if (arguments.length > 0) this.init(keySpec);
}

Vex.Flow.KeySignature.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.KeySignature.prototype.constructor = Vex.Flow.KeySignature;
Vex.Flow.KeySignature.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.KeySignature.prototype.init = function(key_spec) {
  Vex.Flow.KeySignature.superclass.init();

  this.glyphFontScale = 38;
  this.accList = Vex.Flow.keySignature(key_spec);
}

Vex.Flow.KeySignature.prototype.addAccToStave = function(stave, acc) {
  var glyph = new Vex.Flow.Glyph(acc.glyphCode, this.glyphFontScale);
  this.placeGlyphOnLine(glyph, stave, acc.line)
  stave.addGlyph(glyph);
}

Vex.Flow.KeySignature.prototype.addModifier = function(stave) {
  this.convertAccLines(stave.clef, this.accList[0].glyphCode);
  for (var i = 0; i < this.accList.length; ++i) {
    this.addAccToStave(stave, this.accList[i]);
  }
}

Vex.Flow.KeySignature.prototype.addToStave = function(stave, firstGlyph) {
  if (this.accList.length == 0)
    return this;

  if (!firstGlyph) {
    stave.addGlyph(this.makeSpacer(this.padding));
  }

  this.addModifier(stave);
  return this;
}

Vex.Flow.KeySignature.prototype.convertAccLines = function(clef, code) {
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
  if (isTenorSharps) {
    tenorSharps = [3, 1, 2.5, 0.5, 2, 0, 1.5];
    for (var i = 0; i < this.accList.length; ++i) {
      this.accList[i].line = tenorSharps[i];
    }
  }
  else {
    if (clef != "treble") {
      for (var i = 0; i < this.accList.length; ++i) {
        this.accList[i].line += offset;
      }
    }
  }
}
