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
  superclass.init.call(this, {duration: "b"});

  var TYPE = Vex.Flow.Barline.type;
  this.metrics = {
    widths: {}
  }

  this.metrics.widths[TYPE.SINGLE] = 8;
  this.metrics.widths[TYPE.DOUBLE] = 12;
  this.metrics.widths[TYPE.END] = 15;
  this.metrics.widths[TYPE.REPEAT_BEGIN] = 14;
  this.metrics.widths[TYPE.REPEAT_END] = 14;
  this.metrics.widths[TYPE.REPEAT_BOTH] = 18;
  this.metrics.widths[TYPE.NONE] = 0;

  // Note properties
  this.ignore_ticks = true;
  this.type = TYPE.SINGLE;
  this.setWidth(this.metrics.widths[this.type]);
}

Vex.Flow.BarNote.prototype.setType = function(type) {
  this.type = type;
  this.setWidth(this.metrics.widths[this.type]);
  return this;
}

Vex.Flow.BarNote.prototype.getType = function() {
  return this.type;
}

Vex.Flow.BarNote.prototype.setStave = function(stave) {
  var superclass = Vex.Flow.BarNote.superclass;
  superclass.setStave.call(this, stave);
}

Vex.Flow.BarNote.prototype.getBoundingBox = function() {
  return new Vex.Flow.BoundingBox(0, 0, 0, 0);
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

  /*
  var x = this.getAbsoluteX() + this.x_shift;
  if (this.type == Vex.Flow.BarNote.TYPE.SINGLE) {
    this.stave.drawVerticalBarFixed(x);
  } else if (this.type == Vex.Flow.BarNote.TYPE.DOUBLE) {
    this.stave.drawVerticalBarFixed(x);
    this.stave.drawVerticalBarFixed(x + this.metrics.double_x_shift);
  }
  */
  var barline = new Vex.Flow.Barline(this.type, this.getAbsoluteX());
  barline.draw(this.stave, this.getAbsoluteX());
}
