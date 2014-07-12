// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

// Bounding boxes for interactive notation

/** @constructor */
Vex.Flow.BoundingBox = (function() {
  function BoundingBox(x, y, w, h) { this.init(x, y, w, h); }
  BoundingBox.copy = function(that) {
    return new BoundingBox(that.x, that.y, that.w, that.h); };

  BoundingBox.prototype = {
    init: function(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    },

    getX: function() { return this.x; },
    getY: function() { return this.y; },
    getW: function() { return this.w; },
    getH: function() { return this.h; },

    setX: function(x) { this.x = x; return this; },
    setY: function(y) { this.y = y; return this; },
    setW: function(w) { this.w = w; return this; },
    setH: function(h) { this.h = h; return this; },

    move: function(x, y) { this.x += x; this.y += y; },
    clone: function() { return BoundingBox.copy(this); },

    // Merge my box with given box. Creates a bigger bounding box unless
    // the given box is contained in this one.
    mergeWith: function(boundingBox, ctx) {
      var that = boundingBox;

      var new_x = this.x < that.x ? this.x : that.x;
      var new_y = this.y < that.y ? this.y : that.y;
      var new_w = (this.x + this.w) < (that.x + that.w) ? (that.x + that.w) - this.x : (this.x + this.w) - Vex.Min(this.x, that.x);
      var new_h = (this.y + this.h) < (that.y + that.h) ? (that.y + that.h) - this.y : (this.y + this.h) - Vex.Min(this.y, that.y);

      this.x = new_x;
      this.y = new_y;
      this.w = new_w;
      this.h = new_h;

      if (ctx) this.draw(ctx);
      return this;
    },

    draw: function(ctx, x, y) {
      if (!x) x = 0;
      if (!y) y = 0;
      ctx.rect(this.x + x, this.y + y, this.w, this.h);
      ctx.stroke();
    }
  };

  return BoundingBox;
}());