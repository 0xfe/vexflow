// VexFlow - Music Engraving for HTML5
//
// A base class for stave modifiers (e.g. clefs, key signatures)
//


/**
 * @constructor
 */
Vex.Flow.StaveModifier = function() {}

Vex.Flow.StaveModifier.prototype.makeSpacer = function() {
  return {
    getContext: function() {return true;},
    setStave: function() {},
    renderToStave: function() {},
    getMetrics: function() {
      return {width: 10};
    }
  };
}

Vex.Flow.StaveModifier.prototype.placeGlyphOnLine = function(glyph, stave, line) {
  glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs());
}

Vex.Flow.StaveModifier.prototype.addToStave = function(stave, firstGlyph) {
  if (!firstGlyph) {
    stave.addGlyph(this.makeSpacer());
  }

  this.addModifier(stave);
  return this;
}


Vex.Flow.StaveModifier.prototype.addModifier = function() {
  throw new Vex.RERR("MethodNotImplemented",
      "addModifier() not implemented for this stave modifier.");
}

