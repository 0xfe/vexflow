// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.BarNote = function() { this.init(); }
Vex.Flow.BarNote.prototype = new Vex.Flow.Note();
Vex.Flow.BarNote.superclass = Vex.Flow.Note.prototype;
Vex.Flow.BarNote.constructor = Vex.Flow.BarNote;

Vex.Flow.BarNote.prototype.init = function() {
  var superclass = Vex.Flow.BarNote.superclass;
  superclass.init.call(this, "b");

  // Note properties
  this.setWidth(8);
  this.ignore_ticks = true;
}

Vex.Flow.BarNote.prototype.setStave = function(stave) {
  var superclass = Vex.Flow.BarNote.superclass;
  superclass.setStave.call(this, stave);
}

Vex.Flow.BarNote.prototype.addToModifierContext = function(mc) {
  return this;
}

Vex.Flow.BarNote.prototype.preFormat = function() {
  this.setPreFormatted(true);
  return this;
}

Vex.Flow.BarNote.prototype.draw = function() {
  if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
  this.stave.drawVerticalBarFixed(this.getAbsoluteX() + this.x_shift);
}
