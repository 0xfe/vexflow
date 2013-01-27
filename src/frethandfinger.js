// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class to draws string numbers into the notation.

/**
 * @constructor
 */
Vex.Flow.FretHandFinger = function(number) {
  if (arguments.length > 0) this.init(number);
}
Vex.Flow.FretHandFinger.prototype = new Vex.Flow.Modifier();
Vex.Flow.FretHandFinger.prototype.constructor = Vex.Flow.FretHandFinger;
Vex.Flow.FretHandFinger.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.FretHandFinger.prototype.init = function(number) {
  var superclass = Vex.Flow.FretHandFinger.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.finger = number;
  this.width = 7;
  this.position = Vex.Flow.Modifier.Position.LEFT;  // Default position above stem or note head
  this.x_shift = 0;
  this.y_shift = 0;
  this.x_offset = 0;       // Horizontal offset from default
  this.y_offset = 0;       // Vertical offset from default
  this.font = {
    family: "sans-serif",
    size: 9,
    weight: "bold"
  };
}

Vex.Flow.FretHandFinger.prototype.getCategory = function() { return "frethandfinger"; }
Vex.Flow.FretHandFinger.prototype.getNote = function() { return this.note; }
Vex.Flow.FretHandFinger.prototype.setNote = function(note)
  { this.note = note; return this; }
Vex.Flow.FretHandFinger.prototype.getIndex = function() { return this.index; }
Vex.Flow.FretHandFinger.prototype.setIndex = function(index) {
  this.index = index; return this; }
Vex.Flow.FretHandFinger.prototype.getPosition = function() { return this.position; }
Vex.Flow.FretHandFinger.prototype.setPosition = function(position) {
  if (position >= Vex.Flow.Modifier.Position.LEFT &&
      position <= Vex.Flow.Modifier.Position.BELOW)
    this.position = position;
  return this;
}
Vex.Flow.FretHandFinger.prototype.setFretHandFinger = function(number) {
  this.finger = number;
  return this;
}
Vex.Flow.FretHandFinger.prototype.setOffsetX = function(x) {
  this.x_offset = x;
  return this;
}
Vex.Flow.FretHandFinger.prototype.setOffsetY = function(y) {
  this.y_offset = y;
  return this;
}

Vex.Flow.FretHandFinger.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw string number without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw string number without a note and index.");

  var ctx = this.context;
  var start = this.note.getModifierStartXY(this.position, this.index);
  var dot_x = (start.x + this.x_shift + this.x_offset);
  var dot_y = start.y + this.y_shift + this.y_offset + 5;

  switch (this.position) {
    case Vex.Flow.Modifier.Position.ABOVE:
      dot_x -= 4;
      dot_y -= 12;
      break;
    case Vex.Flow.Modifier.Position.BELOW:
      dot_x -= 2;
      dot_y += 10;
      break;
    case Vex.Flow.Modifier.Position.LEFT:
      dot_x -= this.width;
      break;
    case Vex.Flow.Modifier.Position.RIGHT:
      dot_x += 1;
      break;
  }

  ctx.save();
  ctx.setFont(this.font.family, this.font.size, this.font.weight);
  ctx.fillText("" + this.finger, dot_x, dot_y);

  ctx.restore();
}
