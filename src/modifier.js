// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements varies types of modifiers to notes (e.g. bends,
// fingering positions etc.) Accidentals should also be implemented as
// modifiers, eventually.

/**
 * Create a new modifier for the specified note.
 *
 * @constructor
 */
Vex.Flow.Modifier = function() { this.init() }

Vex.Flow.Modifier.Position = {
  LEFT: 1,
  RIGHT: 2,
  ABOVE: 3,
  BELOW: 4
};

Vex.Flow.Modifier.prototype.init = function() {
  this.width = 0;
  this.context = null;
  this.note = null;
  this.index = null;
  this.text_line = 0;
  this.position = Vex.Flow.Modifier.Position.LEFT;
  this.modifier_context = null;
  this.x_shift = 0;
  this.y_shift = 0;
}

// Accessors
Vex.Flow.Modifier.prototype.getCategory = function() { return "none"; }
Vex.Flow.Modifier.prototype.getWidth = function() { return this.width; }
Vex.Flow.Modifier.prototype.setWidth = function(width) {
  this.width = width; return this; }
Vex.Flow.Modifier.prototype.getNote = function() { return this.note; }
Vex.Flow.Modifier.prototype.setNote = function(note)
  { this.note = note; return this; }
Vex.Flow.Modifier.prototype.getIndex = function() { return this.index; }
Vex.Flow.Modifier.prototype.setIndex = function(index) {
  this.index = index; return this; }
Vex.Flow.Modifier.prototype.getContext = function() { return this.context; }
Vex.Flow.Modifier.prototype.setContext = function(context) {
  this.context = context; return this; }
Vex.Flow.Modifier.prototype.getModifierContext = function() {
  return this.modifier_context; }
Vex.Flow.Modifier.prototype.setModifierContext = function(c) {
  this.modifier_context = c; return this; }
Vex.Flow.Modifier.prototype.setTextLine = function(line)
  { this.text_line = line; return this; }
// Shift y pixels in vertical direction
Vex.Flow.Modifier.prototype.setYShift = function(y)
  { this.y_shift = y; return this; }

// Shift x pixels in the direction of the modifier
Vex.Flow.Modifier.prototype.setXShift = function(x) {
  this.x_shift = 0;
  if (this.position == Vex.Flow.Modifier.Position.LEFT) {
    this.x_shift -= x;
  } else {
    this.x_shift += x;
  }
}

Vex.Flow.Modifier.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");
  throw new Vex.RERR("MethodNotImplemented",
      "Draw() not implemented for this modifier.");
}
