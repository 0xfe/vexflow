// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class to draws string numbers into the notation.

/**
 * @constructor
 */
Vex.Flow.StringNumber = function(number) {
  if (arguments.length > 0) this.init(number);
}
Vex.Flow.StringNumber.prototype = new Vex.Flow.Modifier();
Vex.Flow.StringNumber.prototype.constructor = Vex.Flow.StringNumber;
Vex.Flow.StringNumber.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.StringNumber.prototype.init = function(number) {
  var superclass = Vex.Flow.StringNumber.superclass;
  superclass.init.call(this);

  this.note = null;
  this.last_note = null;
  this.index = null;
  this.string_number = number;
  this.setWidth(18);                                 // ???
  this.position = Vex.Flow.Modifier.Position.ABOVE;  // Default position above stem or note head
  this.x_shift = 0;
  this.y_shift = 0;
  this.x_offset = 0;                               // Horizontal offset from default
  this.y_offset = 0;                               // Vertical offset from default
  this.dashed = true;                              // true - draw dashed extension  false - no extension
  this.leg = Vex.Flow.Renderer.LineEndType.NONE;   // draw upward/downward leg at the of extension line
  this.radius = 7;
  this.font = {
    family: "sans-serif",
    size: 9,
    weight: ""
  };
}

Vex.Flow.StringNumber.prototype.getCategory = function() { return "stringnumber"; }
Vex.Flow.StringNumber.prototype.getNote = function() { return this.note; }
Vex.Flow.StringNumber.prototype.setNote = function(note)
  { this.note = note; return this; }
Vex.Flow.StringNumber.prototype.getIndex = function() { return this.index; }
Vex.Flow.StringNumber.prototype.setIndex = function(index) {
  this.index = index; return this; }
Vex.Flow.StringNumber.prototype.setLineEndType = function(leg) {
  if (leg >= Vex.Flow.Renderer.LineEndType.NONE &&
      leg <= Vex.Flow.Renderer.LineEndType.DOWN)
    this.leg = leg;
  return this;
}
Vex.Flow.StringNumber.prototype.getPosition = function() { return this.position; }
Vex.Flow.StringNumber.prototype.setPosition = function(position) {
  if (position >= Vex.Flow.Modifier.Position.LEFT &&
      position <= Vex.Flow.Modifier.Position.BELOW)
    this.position = position;
  return this;
}
Vex.Flow.StringNumber.prototype.setStringNumber = function(number) {
  this.string_number = number;
  return this;
}
Vex.Flow.StringNumber.prototype.setOffsetX = function(x) {
	this.x_offset = x;
	return this;
}
Vex.Flow.StringNumber.prototype.setOffsetY = function(y) {
  this.y_offset = y;
  return this;
}
Vex.Flow.StringNumber.prototype.setLastNote = function(note) {
  this.last_note = note;
  return this;
}
Vex.Flow.StringNumber.prototype.setDashed = function(dashed) {
  this.dashed = dashed;
  return this;
}

Vex.Flow.StringNumber.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw string number without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw string number without a note and index.");

  var ctx = this.context;

  var start = this.note.getModifierStartXY(this.position, this.index);
  var dot_x = (start.x + this.x_shift + this.x_offset);
  var dot_y = start.y + this.y_shift + this.y_offset;
  
  switch (this.position) {
    case Vex.Flow.Modifier.Position.ABOVE:
      dot_y = this.note.getYForTopText(1);
      break;
    case Vex.Flow.Modifier.Position.BELOW:
      var text_line = this.note.getStemDirection() == Vex.Flow.StaveNote.STEM_UP ? 2 : 12;
      dot_y = this.note.getYForBottomText(text_line) + 5;
      break;
    case Vex.Flow.Modifier.Position.LEFT:
      dot_x -= (this.radius / 2) + 5;
      break;
    case Vex.Flow.Modifier.Position.RIGHT:
      dot_x += (this.radius / 2) + 6;
      break;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setFont(this.font.family, this.font.size, this.font.weight);
  var x = dot_x - ctx.measureText(this.string_number).width / 2;
  ctx.fillText("" + this.string_number, x, dot_y + 5);
  
  if (this.last_note != null) {
    var end = this.last_note.getStemX() - this.note.getX() + 5;
    ctx.strokeStyle="#000000";
    ctx.lineCap = "round";
    ctx.lineWidth = .6;
    if (this.dashed)
      Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + 10, dot_y, dot_x + end, dot_y, [3,3]);
    else
      Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + 10, dot_y, dot_x + end, dot_y, [3,0]);
    switch (this.leg) {
      case Vex.Flow.Renderer.LineEndType.UP:
        var len = -10;
        var pattern = this.dashed ? [3,3] : [3,0];
        Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + end, dot_y, dot_x + end, dot_y + len, pattern);
        break;
      case Vex.Flow.Renderer.LineEndType.DOWN:
        var len = 10;
        var pattern = this.dashed ? [3,3] : [3,0];
        Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + end, dot_y, dot_x + end, dot_y + len, pattern);
        break;
    }
  }
  
  ctx.restore();
}
