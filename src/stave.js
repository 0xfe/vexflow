// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.Stave = function(x, y, width, options) {
  if (arguments.length > 0) this.init(x, y, width, options);
}

Vex.Flow.Stave.prototype.init = function(x, y, width, options) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.glyph_start_x = x + 5;
  this.start_x = this.glyph_start_x + 5;
  this.context = null;
  this.glyphs = [];
  this.options = {
    vertical_bar_width: 10, // Width around vertical bar end-marker
    glyph_spacing_px: 10,
    num_lines: 5,
    spacing_between_lines_px: 10, // in pixels
    space_above_staff_ln: 4, // in staff lines
    space_below_staff_ln: 4,  // in staff lines
    top_text_position: 1 // in staff lines
  };
  Vex.Merge(this.options, options);

  this.height =
    (this.options.num_lines + this.options.space_above_staff_ln) *
    this.options.spacing_between_lines_px;
}

Vex.Flow.Stave.prototype.setNoteStartX = function(x) {
  this.start_x = x; return this; }
Vex.Flow.Stave.prototype.getNoteStartX = function() {
  return this.start_x; }
Vex.Flow.Stave.prototype.getTieStartX = function() {
  return this.start_x; }
Vex.Flow.Stave.prototype.getTieEndX = function() {
  return this.x + this.width; }
Vex.Flow.Stave.prototype.setContext = function(context) {
  this.context = context; return this; }
Vex.Flow.Stave.prototype.setY = function(y) {
  this.y = y; return this;
}
Vex.Flow.Stave.prototype.setWidth = function(width) {
  this.width = width; return this;
}
Vex.Flow.Stave.prototype.getHeight = function(width) {
  return this.height;
}

Vex.Flow.Stave.prototype.getBottomY = function() {
  var options = this.options;
  var spacing = options.spacing_between_lines_px;
  var score_bottom = this.getYForLine(options.num_lines) +
    (options.space_below_staff_ln * spacing);

  return score_bottom;
}

Vex.Flow.Stave.prototype.getYForLine = function(line) {
  var options = this.options;
  var spacing = options.spacing_between_lines_px;
  var headroom = options.space_above_staff_ln;
  var y = this.y + ((line * spacing) + (headroom * spacing));

  return y;
}

Vex.Flow.Stave.prototype.getYForTopText = function(line) {
  var l = line || 0;
  return this.getYForLine(-l - this.options.top_text_position);
}

Vex.Flow.Stave.prototype.getYForNote = function(line) {
  var options = this.options;
  var spacing = options.spacing_between_lines_px;
  var headroom = options.space_above_staff_ln;
  var y = this.y + (headroom * spacing) + (5 * spacing) - (line * spacing);

  return y;
}

Vex.Flow.Stave.prototype.getYForGlyphs = function() {
  return this.getYForLine(3);
}

Vex.Flow.Stave.prototype.addGlyph= function(glyph) {
  glyph.setStave(this);
  this.glyphs.push(glyph);
  this.start_x += glyph.getMetrics().width;
  return this;
}

Vex.Flow.Stave.prototype.addModifier = function(modifier) {
  modifier.addToStave(this, (this.glyphs.length == 0));
  return this;
}

Vex.Flow.Stave.prototype.addKeySignature = function(keySpec) {
  this.addModifier(new Vex.Flow.KeySignature(keySpec));
  return this;
}

Vex.Flow.Stave.prototype.addClef = function(clef) {
  this.addModifier(new Vex.Flow.Clef(clef));
  return this;
}

Vex.Flow.Stave.prototype.addTimeSignature = function(timeSpec) {
  this.addModifier(new Vex.Flow.TimeSignature(timeSpec));
  return this;
}

Vex.Flow.Stave.prototype.addTrebleGlyph = function() {
  this.addGlyph(new Vex.Flow.Glyph("v83", 40));
  return this;
}


/**
 * All drawing functions below need the context to be set.
 */
Vex.Flow.Stave.prototype.draw = function(context) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var num_lines = this.options.num_lines;
  var width = this.width;
  var x = this.x;

  this.drawVerticalBar(0);

  for (var line=0; line < num_lines; line++) {
    var y = this.getYForLine(line);
    this.context.fillRect(x, y, width, 1);
  }

  x = this.glyph_start_x;
  for (var i = 0; i < this.glyphs.length; ++i) {
    var glyph = this.glyphs[i];
    if (!glyph.getContext()) glyph.setContext(this.context);
    glyph.renderToStave(x);
    x += glyph.getMetrics().width;
  }

  this.drawVerticalBar(this.width);

  return this;
}

Vex.Flow.Stave.prototype.drawVerticalBar = function(x) {
  this.drawVerticalBarFixed(this.x + x);
}

Vex.Flow.Stave.prototype.drawVerticalBarFixed = function(x) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var top_line = this.getYForLine(0);
  var bottom_line = this.getYForLine(this.options.num_lines - 1);
  this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
}
