// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Support for different rendering contexts: Canvas, Raphael
//
// Copyright Mohit Cheppudira 2010

/* global document: false */

Vex.Flow.Renderer = (function() {
  function Renderer(sel, backend) {
    if (arguments.length > 0) this.init(sel, backend);
  }

  Renderer.Backends = {
    CANVAS: 1,
    RAPHAEL: 2,
    SVG: 3,
    VML: 4
  };

  //End of line types
  Renderer.LineEndType = {
      NONE: 1,        // No leg
      UP: 2,          // Upward leg
      DOWN: 3         // Downward leg
  };

  // Set this to true if you're using VexFlow inside a runtime
  // that does not allow modifiying canvas objects. There is a small
  // performance degradation due to the extra indirection.
  Renderer.USE_CANVAS_PROXY = false;
  Renderer.lastContext = null;

  Renderer.buildContext = function(sel,
      backend, width, height, background) {

    var renderer = new Renderer(sel, backend);
    if (width && height) { renderer.resize(width, height); }

    if (!background) background = "#FFF";
    var ctx = renderer.getContext();
    ctx.setBackgroundFillStyle(background);
    Renderer.lastContext = ctx;
    return ctx;
  };

  Renderer.getCanvasContext = function(sel, width, height, background) {
    return Renderer.buildContext(sel, Renderer.Backends.CANVAS,
        width, height, background);
  };

  Renderer.getRaphaelContext = function(sel, width, height, background) {
    return Renderer.buildContext(sel, Renderer.Backends.RAPHAEL,
        width, height, background);
  };

  Renderer.getSVGContext = function(sel, width, height, background) {
    return Renderer.buildContext(sel, Renderer.Backends.SVG,
        width, height, background);
  };


  Renderer.bolsterCanvasContext = function(ctx) {
    if (Renderer.USE_CANVAS_PROXY) {
      return new Vex.Flow.CanvasContext(ctx);
    }

    var methods = ["clear", "setFont", "setRawFont", "setFillStyle", "setBackgroundFillStyle",
                   "setStrokeStyle", "setShadowColor", "setShadowBlur", "setLineWidth",
                   "setLineCap", "setLineDash", "openGroup", "closeGroup", "getGroup"];
    ctx.vexFlowCanvasContext = ctx;

    for (var i in methods) {
      var method = methods[i];
      ctx[method] = Vex.Flow.CanvasContext.prototype[method];
    }

    return ctx;
  };

  //Draw a dashed line (horizontal, vertical or diagonal
  //dashPattern = [3,3] draws a 3 pixel dash followed by a three pixel space.
  //setting the second number to 0 draws a solid line.
  Renderer.drawDashedLine = function(context, fromX, fromY, toX, toY, dashPattern) {
    context.beginPath();

    var dx = toX - fromX;
    var dy = toY - fromY;
    var angle = Math.atan2(dy, dx);
    var x = fromX;
    var y = fromY;
    context.moveTo(fromX, fromY);
    var idx = 0;
    var draw = true;
    while (!((dx < 0 ? x <= toX : x >= toX) && (dy < 0 ? y <= toY : y >= toY))) {
      var dashLength = dashPattern[idx++ % dashPattern.length];
      var nx = x + (Math.cos(angle) * dashLength);
      x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
      var ny = y + (Math.sin(angle) * dashLength);
      y = dy < 0 ? Math.max(toY, ny) : Math.min(toY, ny);
      if (draw) {
        context.lineTo(x, y);
      } else {
        context.moveTo(x, y);
      }
        draw = !draw;
    }

    context.closePath();
    context.stroke();
  };

  Renderer.prototype = {
    init: function(sel, backend) {
      // Verify selector
      this.sel = sel;
      if (!this.sel) throw new Vex.RERR("BadArgument",
          "Invalid selector for renderer.");

      // Get element from selector
      this.element = document.getElementById(sel);
      if (!this.element) this.element = sel;

      // Verify backend and create context
      this.ctx = null;
      this.paper = null;
      this.backend = backend;
      if (this.backend == Renderer.Backends.CANVAS) {
        // Create context.
        if (!this.element.getContext) throw new Vex.RERR("BadElement",
          "Can't get canvas context from element: " + sel);
        this.ctx = Renderer.bolsterCanvasContext(
            this.element.getContext('2d'));

      } else if (this.backend == Renderer.Backends.RAPHAEL) {
        this.ctx = new Vex.Flow.RaphaelContext(this.element);

      } else if (this.backend == Renderer.Backends.SVG) {
        this.ctx = new Vex.Flow.SVGContext(this.element);

      } else {
        throw new Vex.RERR("InvalidBackend",
          "No support for backend: " + this.backend);
      }
    },

    resize: function(width, height) {
      if (this.backend == Renderer.Backends.CANVAS) {
        if (!this.element.getContext) throw new Vex.RERR("BadElement",
          "Can't get canvas context from element: " + this.sel);
        this.element.width = width;
        this.element.height = height;
        this.ctx = Renderer.bolsterCanvasContext(
            this.element.getContext('2d'));
      } else {
        this.ctx.resize(width, height);
      }

      return this;
    },

    getContext: function() { return this.ctx; }
  };

  return Renderer;
}());


