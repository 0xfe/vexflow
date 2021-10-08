// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { GroupAttributes, RenderContext, TextMeasure } from './rendercontext';
import { warn } from './util';

/**
 * A rendering context for the Canvas backend (CanvasRenderingContext2D).
 */
export class CanvasContext extends RenderContext {
  vexFlowCanvasContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement | { width: number; height: number };
  background_fillStyle?: string;
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

  static SanitizeCanvasDims(width: number, height: number): [number, number] {
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

  /**
   * @param context
   */
  constructor(context: CanvasRenderingContext2D) {
    super();

    // Use a name that is unlikely to clash with a canvas context property.
    this.vexFlowCanvasContext = context;
    if (!context.canvas) {
      this.canvas = {
        width: CanvasContext.WIDTH,
        height: CanvasContext.HEIGHT,
      };
    } else {
      this.canvas = context.canvas;
    }
  }

  clear(): void {
    this.vexFlowCanvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // eslint-disable-next-line
  openGroup(cls: string, id?: string, attrs?: GroupAttributes): any {
    // Containers not implemented.
  }

  closeGroup(): void {
    // Containers not implemented.
  }

  // eslint-disable-next-line
  add(child: any): void {
    // Containers not implemented.
  }

  setFont(family: string, size: number, weight?: string): this {
    this.vexFlowCanvasContext.font = (weight || '') + ' ' + size + 'pt ' + family;
    this.textHeight = (size * 4) / 3;
    return this;
  }

  setRawFont(font: string): this {
    this.vexFlowCanvasContext.font = font;

    const fontArray = font.split(' ');
    const size = Number(fontArray[0].match(/\d+/));
    // The font size is specified in points, scale it to canvas units.
    // CSS specifies dpi to be 96 and there are 72 points to an inch: 96/72 == 4/3.
    this.textHeight = (size * 4) / 3;

    return this;
  }

  setFillStyle(style: string): this {
    this.vexFlowCanvasContext.fillStyle = style;
    return this;
  }

  // TODO: What is this method supposed to do?
  // The SVGContext version doesn't do much...
  // It only fills the area behind some tab number annotations.
  setBackgroundFillStyle(style: string): this {
    /*
    // Should it fill the entire canvas rect? For example:
    const oldFillStyle = this.vexFlowCanvasContext.fillStyle;
    this.vexFlowCanvasContext.fillStyle = style;
    this.vexFlowCanvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.vexFlowCanvasContext.fillStyle = oldFillStyle;
    */
    this.background_fillStyle = style;
    return this;
  }

  setStrokeStyle(style: string): this {
    this.vexFlowCanvasContext.strokeStyle = style;
    return this;
  }

  setShadowColor(color: string): this {
    this.vexFlowCanvasContext.shadowColor = color;
    return this;
  }

  setShadowBlur(blur: number): this {
    // CanvasRenderingContext2D does not scale the shadow blur by the current
    // transform, so we have to do it manually. We assume uniform scaling
    // (though allow for rotation) because the blur can only be scaled
    // uniformly anyway.
    const t = this.vexFlowCanvasContext.getTransform();
    const scale = Math.sqrt(t.a * t.a + t.b * t.b + t.c * t.c + t.d * t.d);
    this.vexFlowCanvasContext.shadowBlur = scale * blur;
    return this;
  }

  setLineWidth(width: number): this {
    this.vexFlowCanvasContext.lineWidth = width;
    return this;
  }

  setLineCap(capType: CanvasLineCap): this {
    this.vexFlowCanvasContext.lineCap = capType;
    return this;
  }

  setLineDash(dash: number[]): this {
    this.vexFlowCanvasContext.setLineDash(dash);
    return this;
  }

  scale(x: number, y: number): this {
    this.vexFlowCanvasContext.scale(x, y);
    return this;
  }

  resize(width: number, height: number): this {
    const canvasElement = this.vexFlowCanvasContext.canvas;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Scale the canvas size by the device pixel ratio clamping to the maximum
    // supported size.
    [width, height] = CanvasContext.SanitizeCanvasDims(width * devicePixelRatio, height * devicePixelRatio);

    // Divide back down by the pixel ratio and convert to integers.
    width = (width / devicePixelRatio) | 0;
    height = (height / devicePixelRatio) | 0;

    canvasElement.width = width * devicePixelRatio;
    canvasElement.height = height * devicePixelRatio;
    canvasElement.style.width = width + 'px';
    canvasElement.style.height = height + 'px';

    return this.scale(devicePixelRatio, devicePixelRatio);
  }

  rect(x: number, y: number, width: number, height: number): this {
    this.vexFlowCanvasContext.rect(x, y, width, height);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number): this {
    this.vexFlowCanvasContext.fillRect(x, y, width, height);
    return this;
  }

  clearRect(x: number, y: number, width: number, height: number): this {
    this.vexFlowCanvasContext.clearRect(x, y, width, height);
    return this;
  }

  beginPath(): this {
    this.vexFlowCanvasContext.beginPath();
    return this;
  }

  moveTo(x: number, y: number): this {
    this.vexFlowCanvasContext.moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number): this {
    this.vexFlowCanvasContext.lineTo(x, y);
    return this;
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this {
    this.vexFlowCanvasContext.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    return this;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this {
    this.vexFlowCanvasContext.quadraticCurveTo(cpx, cpy, x, y);
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this {
    this.vexFlowCanvasContext.arc(x, y, radius, startAngle, endAngle, counterclockwise);
    return this;
  }

  fill(): this {
    this.vexFlowCanvasContext.fill();
    return this;
  }

  stroke(): this {
    this.vexFlowCanvasContext.stroke();
    return this;
  }

  closePath(): this {
    this.vexFlowCanvasContext.closePath();
    return this;
  }

  measureText(text: string): TextMeasure {
    const metrics = this.vexFlowCanvasContext.measureText(text);
    return {
      width: metrics.width,
      height: this.textHeight,
    };
  }

  fillText(text: string, x: number, y: number): this {
    this.vexFlowCanvasContext.fillText(text, x, y);
    return this;
  }

  save(): this {
    this.vexFlowCanvasContext.save();
    return this;
  }

  restore(): this {
    this.vexFlowCanvasContext.restore();
    return this;
  }

  set font(value: string) {
    this.setRawFont(value);
  }

  get font(): string {
    return this.vexFlowCanvasContext.font;
  }

  set fillStyle(style: string | CanvasGradient | CanvasPattern) {
    this.vexFlowCanvasContext.fillStyle = style;
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.vexFlowCanvasContext.fillStyle;
  }

  set strokeStyle(style: string | CanvasGradient | CanvasPattern) {
    this.vexFlowCanvasContext.strokeStyle = style;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.vexFlowCanvasContext.strokeStyle;
  }
}
