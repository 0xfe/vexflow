// Vex Flow Notation
// Implements clefs
//
// Requires vex.js.

/** 
 * @constructor 
 */
Vex.Flow.Clef = function(clef) { 
  if (arguments.length > 0) this.init(clef); 
}

Vex.Flow.Clef.types = {
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
  }
};

Vex.Flow.Clef.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.Clef.prototype.constructor = Vex.Flow.Clef;
Vex.Flow.Clef.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.Clef.prototype.init = function(clef) {
  var superclass = Vex.Flow.Clef.superclass;
  superclass.init.call(this);

  this.clef = Vex.Flow.Clef.types[clef];
}

Vex.Flow.Clef.prototype.addModifier = function(stave) {
  var glyph = new Vex.Flow.Glyph(this.clef.code, this.clef.point);
  this.placeGlyphOnLine(glyph, stave, this.clef.line);
  stave.addGlyph(glyph);
}
