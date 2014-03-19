// Vex Flow - Stem implementation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

Vex.Flow.Stem = (function() {
  var Stem = function(options) {
    if (arguments.length > 0) this.init(options);
  };

  // Stem directions
  Stem.UP = 1;
  Stem.DOWN = -1;

  // Theme
  Stem.WIDTH = Vex.Flow.STEM_WIDTH;
  Stem.HEIGHT = Vex.Flow.STEM_HEIGHT;

  Stem.prototype = {
    init: function(options) {
      this.x_begin = options.x_begin;
      this.x_end = options.x_end;
      this.y_top = options.y_top;
      this.y_bottom = options.y_bottom;
      this.y_extend = options.y_extend || 0;
      this.stem_direction = options.stem_direction;
      this.stem_extension = options.stem_extension;

      // Calculated properties
      this.stem_height = ((this.y_bottom - this.y_top) * this.stem_direction) +
        ((Stem.HEIGHT + this.stem_extension) * this.stem_direction);
    },

    getCategory: function() { return "stem"; },
    setContext: function(context) { this.context = context; return this;},
    getHeight: function() { return this.stem_height; },
    getBoundingBox: function() {
      throw new Vex.RERR("NotImplemented", "getBoundingBox() not implemented.");
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      var ctx = this.context;
      var stem_x, stem_y;
      var stem_direction = this.stem_direction;

      if (stem_direction == Stem.DOWN) {
        // Down stems are rendered to the left of the head.
        stem_x = this.x_begin + (Stem.WIDTH / 2);
        stem_y = this.y_top + 2;
      } else {
        // Up stems are rendered to the right of the head.
        stem_x = this.x_end + (Stem.WIDTH / 2);
        stem_y = this.y_bottom - 2;
      }

      stem_y += this.y_extend * stem_direction;

      // Draw the stem
      ctx.beginPath();
      ctx.setLineWidth(Stem.WIDTH);
      ctx.moveTo(stem_x, stem_y);
      ctx.lineTo(stem_x, stem_y - (this.stem_height - (2 * stem_direction)));
      ctx.stroke();

      /*
      ctx.fillRect(stem_x,
        stem_y - (this.stem_height < 0 ? 0 : this.stem_height),
        Stem.WIDTH,
        Math.abs(this.stem_height));
      */
    }
  };

  return Stem;
}());
