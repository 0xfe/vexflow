// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements dot modifiers for notes.

/**
 * @constructor
 */
Vex.Flow.Dot = function() {
  this.init();
}
Vex.Flow.Dot.prototype = new Vex.Flow.Modifier();
Vex.Flow.Dot.prototype.constructor = Vex.Flow.Dot;
Vex.Flow.Dot.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Dot.prototype.init = function() {
  var superclass = Vex.Flow.Dot.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.position = Vex.Flow.Modifier.Position.RIGHT;

  this.radius = 2;
  this.setWidth(5);
}

Vex.Flow.Dot.prototype.getCategory = function() { return "dots"; }

Vex.Flow.Dot.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw dot without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw dot without a note and index.");

  var start = this.note.getModifierStartXY(this.position, this.index);
  var dot_x = (start.x + this.x_shift) + this.width - this.radius;
  var dot_y = start.y + this.y_shift;

  var ctx = this.context;
  ctx.beginPath();
  ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
  ctx.fill();
}
