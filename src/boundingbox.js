// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

// Bounding boxes for interactive notation

/** @constructor */
Vex.Flow.BoundingBox = function(x, y, w, h) {this.init(x, y, w, h);}

Vex.Flow.BoundingBox.prototype.init = function(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

Vex.Flow.BoundingBox.prototype.getX = function() { return this.x; }
Vex.Flow.BoundingBox.prototype.getY = function() { return this.y; }
Vex.Flow.BoundingBox.prototype.getW = function() { return this.w; }
Vex.Flow.BoundingBox.prototype.getH = function() { return this.h; }

Vex.Flow.BoundingBox.prototype.setX = function(x) { return this.x = x; }
Vex.Flow.BoundingBox.prototype.setY = function(y) { return this.y = y; }
Vex.Flow.BoundingBox.prototype.setW = function(w) { return this.w = w; }
Vex.Flow.BoundingBox.prototype.setH = function(h) { return this.h = h; }

// Merge my box with given box. Creates a bigger bounding box unless
// the given box is contained in this one.
Vex.Flow.BoundingBox.prototype.mergeWith = function(boundingBox, ctx) {
  var that = boundingBox;

  new_x = this.x < that.x ? this.x : that.x;
  new_y = this.y < that.y ? this.y : that.y;
  new_w = (this.x + this.w) < (that.x + that.w) ? (that.x + that.w) - this.x : (this.x + this.w) - Vex.Min(this.x, that.x);
  new_h = (this.y + this.h) < (that.y + that.h) ? (that.y + that.h) - this.y : (this.y + this.h) - Vex.Min(this.y, that.y);

  this.x = new_x;
  this.y = new_y;
  this.w = new_w;
  this.h = new_h;

  if (ctx) this.draw(ctx);
  return this;
}

Vex.Flow.BoundingBox.prototype.draw = function(ctx) {
  ctx.rect(this.x, this.y, this.w, this.h);
  ctx.stroke();
}
