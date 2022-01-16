// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font, FontInfo } from './font';
import { GroupAttributes, RenderContext, TextMeasure } from './rendercontext';
import { globalObject, warn } from './util';
import { isHTMLCanvas } from './web';

// https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/offscreencanvas
// https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/offscreencanvas/index.d.ts

interface OffscreenCanvas extends EventTarget {
  width: number;
  height: number;
  // ...more stuff that we removed.
}

// https://html.spec.whatwg.org/multipage/canvas.html#offscreencanvasrenderingcontext2d
interface OffscreenCanvasRenderingContext2D
  extends CanvasState,
    CanvasTransform,
    CanvasCompositing,
    CanvasImageSmoothing,
    CanvasFillStrokeStyles,
    CanvasShadowStyles,
    CanvasFilters,
    CanvasRect,
    CanvasDrawPath,
    CanvasText,
    CanvasDrawImage,
    CanvasImageData,
    CanvasPathDrawingStyles,
    CanvasTextDrawingStyles,
    CanvasPath {
  readonly canvas: OffscreenCanvas;
}

/**
 * A rendering context for the Canvas backend. This class serves as a proxy for the
 * underlying CanvasRenderingContext2D object, part of the browser's API.
 */
export class CanvasContext extends RenderContext {
  /**  The 2D rendering context from the Canvas API. Forward method calls to this object. */
  context2D: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  /**
   * The HTMLCanvasElement or OffscreenCanvas that is associated with the above context.
   * If there was no associated `<canvas>` element, just store the default WIDTH / HEIGHT.
   */
  canvas: HTMLCanvasElement | OffscreenCanvas | { width: number; height: number };

  /** Height of one line of text (in pixels). */
  textHeight: number = 0;

  static get WIDTH(): number {
    return 600;
  }

  static get HEIGHT(): number {
    return 400;
  }

  static get CANVAS_BROWSER_SIZE_LIMIT(): number {
    return 32767; // Chrome/Firefox. Could be determined more precisely by npm module canvas-size.
  }

  /**
   * Ensure that width and height do not exceed the browser limit.
   * @returns array of [width, height] clamped to the browser limit.
   */
  static sanitizeCanvasDims(width: number, height: number): [number, number] {
    const limit = this.CANVAS_BROWSER_SIZE_LIMIT;
    if (Math.max(width, height) > limit) {
      warn('Canvas dimensions exceed browser limit. Cropping to ' + limit);
      if (width > limit) {
        width = limit;
      }
      if (height > limit) {
        height = limit;
      }
    }
    return [width, height];
  }

  constructor(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    super();
    this.context2D = context;
    if (!context.canvas) {
      this.canvas = {
        width: CanvasContext.WIDTH,
        height: CanvasContext.HEIGHT,
      };
    } else {
      this.canvas = context.canvas;
    }
  }

  /**
   * Set all pixels to transparent black rgba(0,0,0,0).
   */
  clear(): void {
    this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // eslint-disable-next-line
  openGroup(cls?: string, id?: string, attrs?: GroupAttributes): any {
    // Containers not implemented.
  }

  closeGroup(): void {
    // Containers not implemented.
  }

  // eslint-disable-next-line
  add(child: any): void {
    // Containers not implemented.
  }

  setFillStyle(style: string): this {
    this.context2D.fillStyle = style;
    return this;
  }

  /** CanvasContext ignores `setBackgroundFillStyle()`. */
  // eslint-disable-next-line
  setBackgroundFillStyle(style: string): this {
    // DO NOTHING
    return this;
  }

  setStrokeStyle(style: string): this {
    this.context2D.strokeStyle = style;
    return this;
  }

  setShadowColor(color: string): this {
    this.context2D.shadowColor = color;
    return this;
  }

  setShadowBlur(blur: number): this {
    // CanvasRenderingContext2D does not scale the shadow blur by the current
    // transform, so we have to do it manually. We assume uniform scaling
    // (though allow for rotation) because the blur can only be scaled
    // uniformly anyway.
    const t = this.context2D.getTransform();
    const scale = Math.sqrt(t.a * t.a + t.b * t.b + t.c * t.c + t.d * t.d);
    this.context2D.shadowBlur = scale * blur;
    return this;
  }

  setLineWidth(width: number): this {
    this.context2D.lineWidth = width;
    return this;
  }

  setLineCap(capType: CanvasLineCap): this {
    this.context2D.lineCap = capType;
    return this;
  }

  setLineDash(dash: number[]): this {
    this.context2D.setLineDash(dash);
    return this;
  }

  scale(x: number, y: number): this {
    this.context2D.scale(x, y);
    return this;
  }

  resize(width: number, height: number): this {
    const canvas = this.context2D.canvas;
    const devicePixelRatio = globalObject().devicePixelRatio || 1;

    // Scale the canvas size by the device pixel ratio clamping to the maximum supported size.
    [width, height] = CanvasContext.sanitizeCanvasDims(width * devicePixelRatio, height * devicePixelRatio);

    // Divide back down by the pixel ratio and convert to integers.
    width = (width / devicePixelRatio) | 0;
    height = (height / devicePixelRatio) | 0;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    // The canvas could be an instance of either HTMLCanvasElement or an OffscreenCanvas.
    // Only HTMLCanvasElement has a style attribute.
    if (isHTMLCanvas(canvas)) {
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    return this.scale(devicePixelRatio, devicePixelRatio);
  }

  rect(x: number, y: number, width: number, height: number): this {
    this.context2D.rect(x, y, width, height);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number): this {
    this.context2D.fillRect(x, y, width, height);
    return this;
  }

  /**
   * Set the pixels in a rectangular area to transparent black rgba(0,0,0,0).
   */
  clearRect(x: number, y: number, width: number, height: number): this {
    this.context2D.clearRect(x, y, width, height);
    return this;
  }

  beginPath(): this {
    this.context2D.beginPath();
    return this;
  }

  moveTo(x: number, y: number): this {
    this.context2D.moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number): this {
    this.context2D.lineTo(x, y);
    return this;
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this {
    this.context2D.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    return this;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this {
    this.context2D.quadraticCurveTo(cpx, cpy, x, y);
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this {
    this.context2D.arc(x, y, radius, startAngle, endAngle, counterclockwise);
    return this;
  }

  fill(): this {
    this.context2D.fill();
    return this;
  }

  stroke(): this {
    this.context2D.stroke();
    return this;
  }

  closePath(): this {
    this.context2D.closePath();
    return this;
  }

  measureText(text: string): TextMeasure {
    const metrics = this.context2D.measureText(text);

    let y = 0;
    let height = 0;
    if (metrics.fontBoundingBoxAscent) {
      y = -metrics.fontBoundingBoxAscent;
      height = metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent;
    } else {
      y = -metrics.actualBoundingBoxAscent;
      height = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;
    }
    // Return x, y, width & height in the same manner as svg getBBox
    return {
      x: 0,
      y: y,
      width: metrics.width,
      height: height,
    };
  }

  fillText(text: string, x: number, y: number): this {
    this.context2D.fillText(text, x, y);
    return this;
  }

  save(): this {
    this.context2D.save();
    return this;
  }

  restore(): this {
    this.context2D.restore();
    return this;
  }

  set fillStyle(style: string | CanvasGradient | CanvasPattern) {
    this.context2D.fillStyle = style;
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.context2D.fillStyle;
  }

  set strokeStyle(style: string | CanvasGradient | CanvasPattern) {
    this.context2D.strokeStyle = style;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.context2D.strokeStyle;
  }

  /**
   * @param f is 1) a `FontInfo` object or
   *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
   *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
   * @param style is a string (e.g., 'italic', 'normal').
   */
  setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    const fontInfo = Font.validate(f, size, weight, style);
    this.context2D.font = Font.toCSSString(fontInfo);
    this.textHeight = Font.convertSizeToPixelValue(fontInfo.size);
    return this;
  }

  /** Return a string of the form `'italic bold 15pt Arial'` */
  getFont(): string {
    return this.context2D.font;
  }
}
