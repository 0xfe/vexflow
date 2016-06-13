// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the `Stem` object. Generally this object is handled
// by its parent `StemmableNote`.
//
Vex.Flow.Stem = (function() {
  var Stem = function(options) {
    if (arguments.length > 0) this.init(options);
  };

  // To enable logging for this class. Set `Vex.Flow.Stem.DEBUG` to `true`.
  function L() { if (Stem.DEBUG) Vex.L("Vex.Flow.Stem", arguments); }

  // Stem directions
  Stem.UP = 1;
  Stem.DOWN = -1;

  // Theme
  Stem.WIDTH = Vex.Flow.STEM_WIDTH;
  Stem.HEIGHT = Vex.Flow.STEM_HEIGHT;

  // ## Prototype Methods
  Stem.prototype = {
    init: function(options) {
      // Default notehead x bounds
      this.x_begin = options.x_begin || 0;
      this.x_end = options.x_end || 0;

      // Y bounds for top/bottom most notehead
      this.y_top = options.y_top || 0;
      this.y_bottom = options.y_bottom || 0;

      // Stem base extension
      this.y_extend = options.y_extend || 0;
      // Stem top extension
      this.stem_extension = options.stem_extension || 0;

      // Direction of the stem
      this.stem_direction = options.stem_direction || 0;

      // Flag to override all draw calls
      this.hide = false;
    },

    // Set the x bounds for the default notehead
    setNoteHeadXBounds: function(x_begin, x_end) {
      this.x_begin = x_begin;
      this.x_end = x_end;
      return this;
    },

    // Set the direction of the stem in relation to the noteheads
    setDirection: function(direction){ this.stem_direction = direction; },

    // Set the extension for the stem, generally for flags or beams
    setExtension: function(ext) { this.stem_extension = ext; },

    // The the y bounds for the top and bottom noteheads
    setYBounds: function(y_top, y_bottom) {
      this.y_top = y_top;
      this.y_bottom = y_bottom;
    },

    // The category of the object
    getCategory: function() { return "stem"; },

    // Set the canvas context to render on
    setContext: function(context) { this.context = context; return this;},

    // Gets the entire height for the stem
    getHeight: function() {
      return ((this.y_bottom - this.y_top) * this.stem_direction) +
             ((Stem.HEIGHT + this.stem_extension) * this.stem_direction);
    },

    getBoundingBox: function() {
      throw new Vex.RERR("NotImplemented", "getBoundingBox() not implemented.");
    },

    // Get the y coordinates for the very base of the stem to the top of
    // the extension
    getExtents: function() {
      var ys = [this.y_top, this.y_bottom];

      var top_pixel = this.y_top;
      var base_pixel = this.y_bottom;
      var stem_height = Stem.HEIGHT + this.stem_extension;

      for (var i = 0; i < ys.length; ++i) {
        var stem_top = ys[i] + (stem_height * -this.stem_direction);

        if (this.stem_direction == Stem.DOWN) {
          top_pixel = Math.max(top_pixel, stem_top);
          base_pixel = Math.min(base_pixel, ys[i]);
        } else {
          top_pixel = Math.min(top_pixel, stem_top);
          base_pixel = Math.max(base_pixel, ys[i]);
        }
      }

      return { topY: top_pixel, baseY: base_pixel };
    },

    // set the draw style of a stem:
    setStyle: function(style) { this.style = style; return this; },
    getStyle: function() { return this.style; },

    // Apply current style to Canvas `context`
    applyStyle: function(context) {
      var style = this.getStyle();
      if(style) {
        if (style.shadowColor) context.setShadowColor(style.shadowColor);
        if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
        if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
      }
      return this;
    },

    // Render the stem onto the canvas
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      if (this.hide) return;

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

      L("Rendering stem - ", "Top Y: ", this.y_top, "Bottom Y: ", this.y_bottom);

      // Draw the stem
      ctx.save();
      this.applyStyle(ctx);
      ctx.beginPath();
      ctx.setLineWidth(Stem.WIDTH);
      ctx.moveTo(stem_x, stem_y);
      ctx.lineTo(stem_x, stem_y - this.getHeight());
      ctx.stroke();
      ctx.restore();
    }
  };

  return Stem;
}());
