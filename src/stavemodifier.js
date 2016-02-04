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

  StaveModifier.Position = {
    LEFT: 1,
    RIGHT: 2,
    ABOVE: 3,
    BELOW: 4,
    BEGIN: 5,
    END: 6
  };

  StaveModifier.prototype = {
    init: function() {
      this.padding = 10;
      this.position = StaveModifier.Position.ABOVE;
    },

    getPosition: function() { return this.position; },
    setPosition: function(position) { this.position = position; return this; },
    getStave: function() { return this.stave; },
    setStave: function(stave) { this.stave = stave; return this; },
    getWidth: function() { return this.width; },
    setWidth: function(width) { this.width = width; return this; },
    getX: function() { return this.x; },
    setX: function(x) { this.x = x; return this; },

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

    getPadding: function(index) {
      return (index !== undefined && index < 2 ? 0 : this.padding);
    },
    setPadding: function(padding) { this.padding = padding; return this; }
  };

  return StaveModifier;
}());
