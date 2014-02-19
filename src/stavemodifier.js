// VexFlow - Music Engraving for HTML5
//
// A base class for stave modifiers (e.g. clefs, key signatures)
//


/**
 * @constructor
 */
Vex.Flow.StaveModifier = (function() {
  function StaveModifier() {
    this.init();
  }

  StaveModifier.prototype = {
    init: function() {
      this.padding = 10;
    },

    getCategory: function() {return "";},
    makeSpacer: function(padding) {
      return {
        getContext: function() {return true;},
        setStave: function() {},
        renderToStave: function() {},
        getMetrics: function() {
          return {width: padding};
        }
      };
    },

    placeGlyphOnLine: function(glyph, stave, line) {
      glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs());
    },

    setPadding: function(padding) {
      this.padding = padding;
    },

    addToStave: function(stave, firstGlyph) {
      if (!firstGlyph) {
        stave.addGlyph(this.makeSpacer(this.padding));
      }

      this.addModifier(stave);
      return this;
    },

    addToStaveEnd: function(stave, firstGlyph) {
      if (!firstGlyph) {
        stave.addEndGlyph(this.makeSpacer(this.padding));
      }
      else {
        stave.addEndGlyph(this.makeSpacer(2));
      }

      this.addEndModifier(stave);
      return this;
    },

    addModifier: function() {
      throw new Vex.RERR("MethodNotImplemented",
          "addModifier() not implemented for this stave modifier.");
    },

    addEndModifier: function() {
      throw new Vex.RERR("MethodNotImplemented",
          "addEndModifier() not implemented for this stave modifier.");
    }
  };

  return StaveModifier;
}());

