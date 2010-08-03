// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.GhostNote = function(duration) {
  if (arguments.length > 0) this.init(duration); }
Vex.Flow.GhostNote.prototype = new Vex.Flow.Note();
Vex.Flow.GhostNote.superclass = Vex.Flow.Note.prototype;
Vex.Flow.GhostNote.constructor = Vex.Flow.GhostNote;

Vex.Flow.GhostNote.prototype.init = function(duration) {
  var superclass = Vex.Flow.GhostNote.superclass;
  superclass.init.call(this, duration);

  // Note properties
  this.setWidth(0);
}

Vex.Flow.GhostNote.prototype.setStave = function(stave) {
  var superclass = Vex.Flow.GhostNote.superclass;
  superclass.setStave.call(this, stave);
}

Vex.Flow.GhostNote.prototype.addToModifierContext = function(mc) {
  return this;
}

Vex.Flow.GhostNote.prototype.preFormat = function() {
  this.setPreFormatted(true);
  return this;
}

Vex.Flow.GhostNote.prototype.draw = function() {
  if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
  // Nothing to draw
}
