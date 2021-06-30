// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Support for different rendering contexts: Canvas & SVG

import { CanvasContext } from './canvascontext';
import { SVGContext } from './svgcontext';
import { RenderContext } from './types/common';
import { RuntimeError } from './util';

export class Renderer {
  protected elementId?: string | HTMLElement;
  protected element: HTMLCanvasElement;
  protected backend: number;

  protected ctx: RenderContext;
  // eslint-disable-next-line
  protected paper: any;

  static readonly Backends = {
    CANVAS: 1,
    SVG: 2,
  };

  // End of line types
  static readonly LineEndType = {
    NONE: 1, // No leg
    UP: 2, // Upward leg
    DOWN: 3, // Downward leg
  };

  // Set this to true if you're using VexFlow inside a runtime
  // that does not allow modifiying canvas objects. There is a small
  // performance degradation due to the extra indirection.
  static readonly USE_CANVAS_PROXY = false;

  static lastContext: RenderContext | undefined = undefined;

  static buildContext(
    elementId: string | HTMLElement,
    backend: number,
    width: number,
    height: number,
    background?: string
  ): RenderContext {
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

  static getCanvasContext(elementId: string, width: number, height: number, background?: string): RenderContext {
    return Renderer.buildContext(elementId, Renderer.Backends.CANVAS, width, height, background);
  }

  static getSVGContext(elementId: string, width: number, height: number, background?: string): RenderContext {
    return Renderer.buildContext(elementId, Renderer.Backends.SVG, width, height, background);
  }

  // eslint-disable-next-line
  static bolsterCanvasContext(ctx: any): RenderContext {
    if (Renderer.USE_CANVAS_PROXY) {
      return new CanvasContext(ctx);
    }

    // Modify the CanvasRenderingContext2D to include the following methods, if they do not already exist.
    // setLineDash exists natively: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
    const methodNames = [
      'clear',
      'setFont',
      'setRawFont',
      'setFillStyle',
      'setBackgroundFillStyle',
      'setStrokeStyle',
      'setShadowColor',
      'setShadowBlur',
      'setLineWidth',
      'setLineCap',
      'setLineDash',
      'openGroup',
      'closeGroup',
      'getGroup',
    ];

    ctx.vexFlowCanvasContext = ctx;

    methodNames.forEach((methodName) => {
      // eslint-disable-next-line
      ctx[methodName] = ctx[methodName] || (CanvasContext.prototype as any)[methodName];
    });

    return ctx;
  }

  // Draw a dashed line (horizontal, vertical or diagonal
  // dashPattern = [3,3] draws a 3 pixel dash followed by a three pixel space.
  // setting the second number to 0 draws a solid line.
  static drawDashedLine(
    context: RenderContext,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    dashPattern: number[]
  ): void {
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
      const nx = x + Math.cos(angle) * dashLength;
      x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
      const ny = y + Math.sin(angle) * dashLength;
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

  constructor(elementId: string | HTMLElement, backend: number) {
    this.elementId = elementId;
    if (this.elementId === undefined) {
      throw new RuntimeError('BadArgument', 'Invalid id for renderer.');
    }

    this.element = document.getElementById(elementId as string) as HTMLCanvasElement;
    if (!this.element) this.element = elementId as HTMLCanvasElement;

    // Verify backend and create context
    this.backend = backend;
    if (this.backend === Renderer.Backends.CANVAS) {
      if (!this.element.getContext) {
        throw new RuntimeError('BadElement', `Can't get canvas context from element: ${elementId}`);
      }
      this.ctx = Renderer.bolsterCanvasContext(this.element.getContext('2d'));
    } else if (this.backend === Renderer.Backends.SVG) {
      this.ctx = new SVGContext(this.element);
    } else {
      throw new RuntimeError('InvalidBackend', `No support for backend: ${this.backend}`);
    }
  }

  resize(width: number, height: number): this {
    if (this.backend === Renderer.Backends.CANVAS) {
      if (!this.element.getContext) {
        throw new RuntimeError('BadElement', `Can't get canvas context from element: ${this.elementId}`);
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

  getContext(): RenderContext {
    return this.ctx;
  }
}
