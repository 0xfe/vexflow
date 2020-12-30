// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Support for different rendering contexts: Canvas, Raphael
import {CanvasContext} from './canvascontext';
import {RaphaelContext} from './raphaelcontext';
import {SVGContext} from './svgcontext';
import {DrawContext} from "./types/common";
import {RuntimeError} from "./runtimeerror";

let lastContext: DrawContext = null;

export enum Backends {
  CANVAS = 1,
  RAPHAEL = 2,
  SVG = 3,
  VML = 4
}

export enum LineEndType {
  NONE = 1,   // No leg
  UP = 2,     // Upward leg
  DOWN = 3    // Downward leg
}

export class Renderer {
  private readonly elementRef: string | HTMLElement;
  private readonly element: HTMLCanvasElement;
  private readonly backend: number;

  private ctx: DrawContext;
  private paper: any;

  static get Backends(): typeof Backends {
    return Backends;
  }

  // End of line types
  static get LineEndType(): typeof LineEndType {
    return LineEndType;
  }

  // Set this to true if you're using VexFlow inside a runtime
  // that does not allow modifiying canvas objects. There is a small
  // performance degradation due to the extra indirection.
  static get USE_CANVAS_PROXY(): boolean {
    return false;
  }

  static get lastContext(): DrawContext {
    return lastContext;
  }

  static set lastContext(ctx: DrawContext) {
    lastContext = ctx;
  }

  static buildContext(elementId: string, backend: number, width: number, height: number, background: string): DrawContext {
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

  static getCanvasContext(elementId: string, width: number, height: number, background: string): DrawContext {
    return Renderer.buildContext(elementId, Renderer.Backends.CANVAS, width, height, background);
  }

  static getRaphaelContext(elementId: string, width: number, height: number, background: string): DrawContext {
    return Renderer.buildContext(elementId, Renderer.Backends.RAPHAEL, width, height, background);
  }

  static getSVGContext(elementId: string, width: number, height: number, background: string): DrawContext {
    return Renderer.buildContext(elementId, Renderer.Backends.SVG, width, height, background);
  }

  static bolsterCanvasContext(ctx: any): DrawContext {
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
      ctx[methodName] = ctx[methodName] || (CanvasContext.prototype as any)[methodName];
    });

    return ctx;
  }

  // Draw a dashed line (horizontal, vertical or diagonal
  // dashPattern = [3,3] draws a 3 pixel dash followed by a three pixel space.
  // setting the second number to 0 draws a solid line.
  static drawDashedLine(context: DrawContext, fromX: number, fromY: number, toX: number, toY: number, dashPattern: number[]): void {
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

  constructor(elementRef: string | HTMLElement, backend: number) {
    this.elementRef = elementRef;
    if (!this.elementRef) {
      throw new RuntimeError('BadArgument', 'Invalid id for renderer.');
    }

    this.element = document.getElementById(elementRef as string) as HTMLCanvasElement;
    if (!this.element) this.element = elementRef as HTMLCanvasElement;

    // Verify backend and create context
    this.ctx = null;
    this.paper = null;
    this.backend = backend;
    if (this.backend === Renderer.Backends.CANVAS) {
      // Create context.
      if (!this.element.getContext) {
        throw new RuntimeError('BadElement', `Can't get canvas context from element: ${elementRef}`);
      }
      this.ctx = Renderer.bolsterCanvasContext(this.element.getContext('2d'));
    } else if (this.backend === Renderer.Backends.RAPHAEL) {
      this.ctx = new RaphaelContext(this.element);
    } else if (this.backend === Renderer.Backends.SVG) {
      this.ctx = new SVGContext(this.element);
    } else {
      throw new RuntimeError('InvalidBackend', `No support for backend: ${this.backend}`);
    }
  }

  resize(width: number, height: number): this {
    if (this.backend === Renderer.Backends.CANVAS) {
      if (!this.element.getContext) {
        throw new RuntimeError(
          'BadElement', `Can't get canvas context from element: ${this.elementRef}`
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
      this.ctx.resize(width.toString(), height.toString());
    }

    return this;
  }

  getContext(): DrawContext {
    return this.ctx;
  }
}
