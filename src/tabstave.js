// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.TabStave = function(x, y, width, options) {
  if (arguments.length > 0) this.init(x, y, width, options);
}

Vex.Flow.TabStave.prototype = new Vex.Flow.Stave();
Vex.Flow.TabStave.prototype.constructor = Vex.Flow.TabStave;
Vex.Flow.TabStave.superclass = Vex.Flow.Stave.prototype;

Vex.Flow.TabStave.prototype.init = function(x, y, width, options) {
  var superclass = Vex.Flow.TabStave.superclass;
  var tab_options = {
    spacing_between_lines_px: 13,
    num_lines: 6,
    top_text_position: 1
  };

  Vex.Merge(tab_options, options);
  superclass.init.call(this, x, y, width, tab_options);
}

Vex.Flow.TabStave.prototype.getYForGlyphs = function() {
  return this.getYForLine(2.5);
}

Vex.Flow.TabStave.prototype.addTabGlyph = function() {
  this.addGlyph(new Vex.Flow.Glyph("v2f", 40));
  return this;
}
