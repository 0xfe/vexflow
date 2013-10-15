// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.TabStave = (function() {
  function TabStave(x, y, width, options) {
    if (arguments.length > 0) this.init(x, y, width, options);
  }

  Vex.Inherit(TabStave, Vex.Flow.Stave, {
    init: function(x, y, width, options) {
      var tab_options = {
        spacing_between_lines_px: 13,
        num_lines: 6,
        top_text_position: 1,
        bottom_text_position: 7
      };

      Vex.Merge(tab_options, options);
      TabStave.superclass.init.call(this, x, y, width, tab_options);
    },

    setNumberOfLines: function(lines) {
      this.options.num_lines = lines; return this;
    },

    getYForGlyphs: function() {
      return this.getYForLine(2.5);
    },

    addTabGlyph: function() {
      var glyphScale;
      var glyphOffset;

      switch(this.options.num_lines) {
        case 6:
          glyphScale = 40;
          glyphOffset = 0;
          break;
        case 5:
          glyphScale = 30;
          glyphOffset = -6;
          break;
        case 4:
          glyphScale = 23;
          glyphOffset = -12;
          break;
      }

      var tabGlyph = new Vex.Flow.Glyph("v2f", glyphScale);
      tabGlyph.y_shift = glyphOffset;
      this.addGlyph(tabGlyph);
      return this;
    }
  });

  return TabStave;
}());