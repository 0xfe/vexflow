// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2011
// Implements stave section names.

/**
 * @constructor
 */
Vex.Flow.StaveSection = function(section, x, shift_y) {
  if (arguments.length > 0) this.init(section, x, shift_y);
}
Vex.Flow.StaveSection.prototype = new Vex.Flow.Modifier();
Vex.Flow.StaveSection.prototype.constructor = Vex.Flow.StaveSection;
Vex.Flow.StaveSection.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.StaveSection.prototype.init = function(section, x, shift_y) {
  var superclass = Vex.Flow.StaveSection.superclass;
  superclass.init.call(this);

  this.setWidth(16);// ???
  this.section = section;
  this.position = Vex.Flow.Modifier.Position.ABOVE;
  this.x = x;
  this.shift_x = 0;
  this.shift_y = shift_y;
  this.font = {
    family: "sans-serif",
    size: 12,
    weight: "bold"
  };
}

Vex.Flow.StaveSection.prototype.getCategory = function() { return "stavesection"; }
Vex.Flow.StaveSection.prototype.setStaveSection = function(section) {
  this.section = section;
  return this;
}
Vex.Flow.StaveSection.prototype.setShiftX = function(x) {
  this.shift_x = x; return this;
}
Vex.Flow.StaveSection.prototype.setShiftY = function(x) {
  this.shift_y = y; return this;
}

Vex.Flow.StaveSection.prototype.draw = function(stave, shift_x) {
  if (!stave.context) throw new Vex.RERR("NoContext",
    "Can't draw stave section without a context.");

  var ctx = stave.context;

  ctx.save();
  ctx.lineWidth = 2;
  ctx.setFont(this.font.family, this.font.size, this.font.weight);
  var text_width = ctx.measureText("" + this.section).width;
  var width = text_width + 6;  // add left & right padding
  if (width < 18) width = 18;
  var height = 20;
    //  Seems to be a good default y
  var y = stave.getYForTopText(3) + this.shift_y;
  var x = this.x + shift_x;
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.rect(x, y, width, height);
  ctx.stroke();
  x += (width - text_width) / 2;
  ctx.fillText("" + this.section, x, y + 16);
  ctx.restore();
  return this;
}
