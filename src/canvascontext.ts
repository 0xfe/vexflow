// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { RenderContext } from './types/common';
import { warn } from './util';

/**
 * A rendering context for the Canvas backend (CanvasRenderingContext2D).
 */
export class CanvasContext implements RenderContext {
  vexFlowCanvasContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement | { width: number; height: number };
  background_fillStyle?: string;

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
   * This constructor is only called if Renderer.USE_CANVAS_PROXY is true.
   * In most instances, we do not need to create a CanvasContext object.
   * See Renderer.bolsterCanvasContext().
   * @param context
   */
  constructor(context: CanvasRenderingContext2D) {
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
  openGroup(cls: string, id?: string, attrs?: { pointerBBox: boolean }): any {
    // Containers not implemented.
  }

  closeGroup(): void {
    // Containers not implemented.
  }

  // eslint-disable-next-line
  add(child: any): void {
    // Containers not implemented.
  }

  setFont(family: string, size: number, weight: string): this {
    this.vexFlowCanvasContext.font = (weight || '') + ' ' + size + 'pt ' + family;
    return this;
  }

  setRawFont(font: string): this {
    this.vexFlowCanvasContext.font = font;
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
    this.vexFlowCanvasContext.shadowBlur = blur;
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

  // setLineDash is the one native method in a canvas context
  // that begins with set, therefore we don't bolster the method
  // if it already exists (see Renderer.bolsterCanvasContext).
  // If it doesn't exist, we bolster it and assume it's looking for
  // a ctx.lineDash method, as previous versions of VexFlow
  // expected.
  setLineDash(dash: number[]): this {
    // eslint-disable-next-line
    (this.vexFlowCanvasContext as any).lineDash = dash;
    return this;
  }

  // Only called if Renderer.USE_CANVAS_PROXY is true.
  scale(x: number, y: number): this {
    this.vexFlowCanvasContext.scale(x, y);
    return this;
  }

  // CanvasRenderingContext2D does not have a resize function.
  // renderer.ts calls ctx.scale() instead, so this method is never used.
  // eslint-disable-next-line
  resize(width: number, height: number): this {
    // DO NOTHING.
    return this;
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

  // This is an attempt (hack) to simulate the HTML5 canvas arc method.
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise: boolean): this {
    this.vexFlowCanvasContext.arc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
  }

  // CanvasRenderingContext2D does not have a glow function.
  glow(): this {
    // DO NOTHING.
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

  measureText(text: string): TextMetrics {
    return this.vexFlowCanvasContext.measureText(text);
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
    this.vexFlowCanvasContext.font = value;
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
