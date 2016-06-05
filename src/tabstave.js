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
        top_text_position: 1
      };

      Vex.Merge(tab_options, options);
      TabStave.superclass.init.call(this, x, y, width, tab_options);
    },

    getYForGlyphs: function() {
      return this.getYForLine(2.5);
    },

    // Deprecated
    addTabGlyph: function() {
      this.addClef('tab');
      return this;
    }
  });

  return TabStave;
}());
