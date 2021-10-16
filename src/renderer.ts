// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { CanvasContext } from './canvascontext';
import { RenderContext } from './rendercontext';
import { SVGContext } from './svgcontext';
import { RuntimeError } from './util';

// A ContextBuilder is either Renderer.getSVGContext or Renderer.getCanvasContext.
export type ContextBuilder = typeof Renderer.getSVGContext | typeof Renderer.getCanvasContext;

// eslint-disable-next-line
function isRenderContext(obj: any): obj is RenderContext {
  return obj.setShadowBlur !== undefined;
}

/**
 * Support Canvas & SVG rendering contexts.
 */
export class Renderer {
  protected ctx: RenderContext;

  static lastContext?: RenderContext = undefined;

  static buildContext(
    elementId: string | HTMLCanvasElement | HTMLDivElement,
    backend: number,
    width: number,
    height: number,
    background: string = '#FFF'
  ): RenderContext {
    const renderer = new Renderer(elementId, backend);
    if (width && height) {
      renderer.resize(width, height);
    }

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
  constructor(context: RenderContext);
  constructor(canvas: string | HTMLCanvasElement | HTMLDivElement, backend: number);
  constructor(arg0: string | HTMLCanvasElement | HTMLDivElement | RenderContext, arg1?: number) {
    if (isRenderContext(arg0)) {
      // The user has provided what looks like a RenderContext, let's just use it.
      // TODO(tommadams): RenderContext is an interface, can we introduce a context base class
      // to make this check more robust?
      this.ctx = arg0;
    } else {
      if (arg1 === undefined) {
        // The backend must be specified if the render context isn't directly provided.
        throw new RuntimeError('InvalidArgument', 'Missing backend argument');
      }
      const backend: number = arg1;

      let element: HTMLElement;
      if (typeof arg0 == 'string') {
        const maybeElement = document.getElementById(arg0);
        if (maybeElement == null) {
          throw new RuntimeError('BadElementId', `Can't find element with ID "${maybeElement}"`);
        }
        element = maybeElement;
      } else {
        element = arg0 as HTMLElement;
      }

      // Verify backend and create context
      if (backend === Renderer.Backends.CANVAS) {
        if (!(element instanceof window.HTMLCanvasElement)) {
          throw new RuntimeError('BadElement', 'CANVAS context requires an HTMLCanvasElement');
        }
        const context = element.getContext('2d');
        if (!context) {
          throw new RuntimeError('BadElement', "Can't get canvas context");
        }
        this.ctx = new CanvasContext(context);
      } else if (backend === Renderer.Backends.SVG) {
        if (!(element instanceof window.HTMLDivElement)) {
          throw new RuntimeError('BadElement', 'SVG context requires an HTMLDivElement.');
        }
        this.ctx = new SVGContext(element);
      } else {
        throw new RuntimeError('InvalidBackend', `No support for backend: ${backend}`);
      }
    }
  }

  resize(width: number, height: number): this {
    this.ctx.resize(width, height);
    return this;
  }

  getContext(): RenderContext {
    return this.ctx;
  }
}

// eslint-disable-next-line
export namespace Renderer {
  export enum Backends {
    CANVAS = 1,
    SVG = 2,
  }

  // End of line types
  export enum LineEndType {
    NONE = 1, // No leg
    UP = 2, // Upward leg
    DOWN = 3, // Downward leg
  }
}
