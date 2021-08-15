// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { CanvasContext } from './canvascontext';
import { SVGContext } from './svgcontext';
import { RenderContext } from './types/common';
import { RuntimeError } from './util';

// A ContextBuilder is either Renderer.getSVGContext or Renderer.getCanvasContext.
export type ContextBuilder = typeof Renderer.getSVGContext | typeof Renderer.getCanvasContext;

/**
 * Support Canvas & SVG rendering contexts.
 */
export class Renderer {
  protected elementId?: string;
  protected element: HTMLCanvasElement | HTMLDivElement;
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

  /**
   * Set this to true if you're using VexFlow inside a runtime
   * that does not allow modifying canvas objects. There is a small
   * performance degradation due to the extra indirection.
   */
  static readonly USE_CANVAS_PROXY = false;

  static lastContext?: RenderContext = undefined;

  static buildContext(
    elementId: string,
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
    // TODO: Is a Proxy object appropriate here?
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
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
      'openGroup',
      'closeGroup',
      'getGroup',
    ];

    ctx.vexFlowCanvasContext = ctx;

    methodNames.forEach((methodName) => {
      if (!(methodName in ctx)) {
        // eslint-disable-next-line
        ctx[methodName] = (CanvasContext.prototype as any)[methodName];
      }
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

  /**
   * @param canvasId can be:
   *   - a string element ID (of a canvas or div element)
   *   - a canvas element
   *   - a div element, which will contain the SVG output
   * @param backend Renderer.Backends.CANVAS or Renderer.Backends.SVG
   */
  constructor(canvasId: string | HTMLCanvasElement | HTMLDivElement, backend: number) {
    if (!canvasId) {
      throw new RuntimeError('BadArgument', 'Invalid id for renderer.');
    } else if (typeof canvasId === 'string') {
      this.elementId = canvasId;
      this.element = document.getElementById(canvasId as string) as HTMLCanvasElement | HTMLDivElement;
    } else if ('getContext' in canvasId /* HTMLCanvasElement */) {
      this.element = canvasId as HTMLCanvasElement;
    } else {
      // Assume it's a HTMLDivElement.
      this.element = canvasId as HTMLDivElement;
    }

    // Verify backend and create context
    this.backend = backend;
    if (this.backend === Renderer.Backends.CANVAS) {
      const canvasElement = this.element as HTMLCanvasElement;
      if (!canvasElement.getContext) {
        throw new RuntimeError('BadElement', `Can't get canvas context from element: ${canvasId}`);
      }
      this.ctx = Renderer.bolsterCanvasContext(canvasElement.getContext('2d'));
    } else if (this.backend === Renderer.Backends.SVG) {
      this.ctx = new SVGContext(this.element);
    } else {
      throw new RuntimeError('InvalidBackend', `No support for backend: ${this.backend}`);
    }
  }

  resize(width: number, height: number): this {
    if (this.backend === Renderer.Backends.CANVAS) {
      const canvasElement = this.element as HTMLCanvasElement;
      [width, height] = CanvasContext.SanitizeCanvasDims(width, height);

      const devicePixelRatio = window.devicePixelRatio || 1;

      canvasElement.width = width * devicePixelRatio;
      canvasElement.height = height * devicePixelRatio;
      canvasElement.style.width = width + 'px';
      canvasElement.style.height = height + 'px';

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
