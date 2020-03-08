// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Support for different rendering contexts: Canvas, Raphael

import { CanvasContext } from './canvascontext';
import { RaphaelContext } from './raphaelcontext';
import { SVGContext } from './svgcontext';
import { Vex } from './vex';

let lastContext = null;

export class Renderer {
  static get Backends() {
    return {
      CANVAS: 1,
      RAPHAEL: 2,
      SVG: 3,
      VML: 4,
    };
  }

  // End of line types
  static get LineEndType() {
    return {
      NONE: 1, // No leg
      UP: 2,   // Upward leg
      DOWN: 3, // Downward leg
    };
  }

  // Set this to true if you're using VexFlow inside a runtime
  // that does not allow modifiying canvas objects. There is a small
  // performance degradation due to the extra indirection.
  static get USE_CANVAS_PROXY() {
    return false;
  }

  static get lastContext() {
    return lastContext;
  }
  static set lastContext(ctx) {
    lastContext = ctx;
  }

  static buildContext(elementId, backend, width, height, background) {
    const renderer = new Renderer(elementId, backend);
    if (width && height) {
      renderer.resize(width, height);
    }

    if (!background) background = '#FFF';
    const ctx = renderer.getContext();
    ctx.setBackgroundFillStyle(background);
    Renderer.lastContext = ctx;
    return ctx;
  }

  static getCanvasContext(elementId, width, height, background) {
    return Renderer.buildContext(elementId, Renderer.Backends.CANVAS, width, height, background);
  }

  static getRaphaelContext(elementId, width, height, background) {
    return Renderer.buildContext(elementId, Renderer.Backends.RAPHAEL, width, height, background);
  }

  static getSVGContext(elementId, width, height, background) {
    return Renderer.buildContext(elementId, Renderer.Backends.SVG, width, height, background);
  }

  static bolsterCanvasContext(ctx) {
    if (Renderer.USE_CANVAS_PROXY) {
      return new CanvasContext(ctx);
    }

    const methodNames = [
      'clear', 'setFont', 'setRawFont', 'setFillStyle', 'setBackgroundFillStyle',
      'setStrokeStyle', 'setShadowColor', 'setShadowBlur', 'setLineWidth',
      'setLineCap', 'setLineDash', 'openGroup', 'closeGroup', 'getGroup',
    ];

    ctx.vexFlowCanvasContext = ctx;

    methodNames.forEach(methodName => {
      ctx[methodName] = ctx[methodName] || CanvasContext.prototype[methodName];
    });

    return ctx;
  }

  // Draw a dashed line (horizontal, vertical or diagonal
  // dashPattern = [3,3] draws a 3 pixel dash followed by a three pixel space.
  // setting the second number to 0 draws a solid line.
  static drawDashedLine(context, fromX, fromY, toX, toY, dashPattern) {
    context.beginPath();

    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    let x = fromX;
    let y = fromY;
    context.moveTo(fromX, fromY);
    let idx = 0;
    let draw = true;
    while (!((dx < 0 ? x <= toX : x >= toX) && (dy < 0 ? y <= toY : y >= toY))) {
      const dashLength = dashPattern[idx++ % dashPattern.length];
      const nx = x + (Math.cos(angle) * dashLength);
      x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
      const ny = y + (Math.sin(angle) * dashLength);
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
  }

  constructor(elementId, backend) {
    this.elementId = elementId;
    if (!this.elementId) {
      throw new Vex.RERR('BadArgument', 'Invalid id for renderer.');
    }

    this.element = document.getElementById(elementId);
    if (!this.element) this.element = elementId;

    // Verify backend and create context
    this.ctx = null;
    this.paper = null;
    this.backend = backend;
    if (this.backend === Renderer.Backends.CANVAS) {
      // Create context.
      if (!this.element.getContext) {
        throw new Vex.RERR('BadElement', `Can't get canvas context from element: ${elementId}`);
      }
      this.ctx = Renderer.bolsterCanvasContext(this.element.getContext('2d'));
    } else if (this.backend === Renderer.Backends.RAPHAEL) {
      this.ctx = new RaphaelContext(this.element);
    } else if (this.backend === Renderer.Backends.SVG) {
      this.ctx = new SVGContext(this.element);
    } else {
      throw new Vex.RERR('InvalidBackend', `No support for backend: ${this.backend}`);
    }
  }

  resize(width, height) {
    if (this.backend === Renderer.Backends.CANVAS) {
      if (!this.element.getContext) {
        throw new Vex.RERR(
          'BadElement', `Can't get canvas context from element: ${this.elementId}`
        );
      }
      [width, height] = CanvasContext.SanitizeCanvasDims(width, height);

      const devicePixelRatio = window.devicePixelRatio || 1;

      this.element.width = width * devicePixelRatio;
      this.element.height = height * devicePixelRatio;
      this.element.style.width = width + 'px';
      this.element.style.height = height + 'px';

      this.ctx = Renderer.bolsterCanvasContext(this.element.getContext('2d'));
      this.ctx.scale(devicePixelRatio, devicePixelRatio);
    } else {
      this.ctx.resize(width, height);
    }

    return this;
  }

  getContext() { return this.ctx; }
}
