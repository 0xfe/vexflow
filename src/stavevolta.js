// Vex Flow Notation
// Author Larry Kuhns 2011
// Implements voltas (repeat brackets)
//
// Requires vex.js.

/** 
 * @constructor 
 */
Vex.Flow.Volta = function(type, number, x, y_shift) { 
  if (arguments.length > 0) this.init(type, number, x, y_shift); 
}

Vex.Flow.Volta.type = {
  NONE: 1,
  BEGIN: 2,
  MID: 3,
  END: 4,
  BEGIN_END: 5
};

Vex.Flow.Volta.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.Volta.prototype.constructor = Vex.Flow.Volta;
Vex.Flow.Volta.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.Volta.prototype.init = function(type, number, x, y_shift) {
  var superclass = Vex.Flow.Volta.superclass;
  superclass.init.call(this);

  this.volta = type;
  this.x = x;
  this.y_shift = y_shift;
  this.number = number;
  this.font = {
    family: "sans-serif",
    size: 9,
    weight: "bold"
  };
}

Vex.Flow.Volta.prototype.getCategory = function() {return "voltas";}

Vex.Flow.Volta.prototype.setShiftY = function(y) {
  this.y_shift = y; return this;
}

Vex.Flow.Volta.prototype.draw = function(stave, x) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
    "Can't draw stave without canvas context.");
  var ctx = stave.context;
  var width = stave.width;
  var top_y = stave.getYForTopText(stave.options.num_lines) 
            + this.y_shift;
  var vert_height = 1.5 * stave.options.spacing_between_lines_px;
  switch(this.volta) {
    case Vex.Flow.Volta.type.BEGIN:
      ctx.fillRect(this.x + x, top_y, 1, vert_height);
      break;
    case Vex.Flow.Volta.type.END:
      width -= 5;
      ctx.fillRect(this.x + x + width, top_y, 1, vert_height);
      break;
    case Vex.Flow.Volta.type.BEGIN_END:
      width -= 3;
      ctx.fillRect(this.x + x, top_y, 1, vert_height);
      ctx.fillRect(this.x + x + width, top_y, 1, vert_height);
      break;
  }
    // If the beginning of a volta, draw measure number
  if (this.volta == Vex.Flow.Volta.type.BEGIN ||
      this.volta == Vex.Flow.Volta.type.BEGIN_END) {
    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    ctx.fillText(this.number, this.x + x + 5, top_y + 15);
    ctx.restore();
  }
  ctx.fillRect(this.x + x, top_y, width, 1);
  return this;    
}