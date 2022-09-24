// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2021.
// MIT License

import { FontInfo } from './font';
import { Category } from './typeguard';

export interface TextMeasure {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GroupAttributes {
  pointerBBox: boolean;
}

export abstract class RenderContext {
  static get CATEGORY(): string {
    return Category.RenderContext;
  }

  abstract clear(): void;
  abstract setFillStyle(style: string): this;
  abstract setBackgroundFillStyle(style: string): this;
  abstract setStrokeStyle(style: string): this;
  abstract setShadowColor(color: string): this;
  abstract setShadowBlur(blur: number): this;
  abstract setLineWidth(width: number): this;
  abstract setLineCap(capType: CanvasLineCap): this;
  abstract setLineDash(dashPattern: number[]): this;
  abstract scale(x: number, y: number): this;
  abstract rect(x: number, y: number, width: number, height: number): this;
  abstract resize(width: number, height: number): this;
  abstract fillRect(x: number, y: number, width: number, height: number): this;
  abstract clearRect(x: number, y: number, width: number, height: number): this;
  abstract beginPath(): this;
  abstract moveTo(x: number, y: number): this;
  abstract lineTo(x: number, y: number): this;
  abstract bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
  abstract quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
  abstract arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean
  ): this;
  // eslint-disable-next-line
  abstract fill(attributes?: any): this;
  abstract stroke(): this;
  abstract closePath(): this;
  abstract fillText(text: string, x: number, y: number): this;
  abstract save(): this;
  abstract restore(): this;
  // eslint-disable-next-line
  abstract openGroup(cls?: string, id?: string, attrs?: GroupAttributes): any;
  abstract closeGroup(): void;
  // eslint-disable-next-line
  abstract add(child: any): void;
  abstract measureText(text: string): TextMeasure;

  abstract set fillStyle(style: string | CanvasGradient | CanvasPattern);
  abstract get fillStyle(): string | CanvasGradient | CanvasPattern;

  abstract set strokeStyle(style: string | CanvasGradient | CanvasPattern);
  abstract get strokeStyle(): string | CanvasGradient | CanvasPattern;

  abstract setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this;
  abstract getFont(): string;

  set font(f: string) {
    this.setFont(f);
  }
  get font(): string {
    return this.getFont();
  }

  /**
   * This is kept for backwards compatibility with 3.0.9.
   * @deprecated use `setFont(...)` instead since it now supports CSS font shorthand.
   */
  setRawFont(f: string): this {
    this.setFont(f);
    return this;
  }
}

/**
 * Draw a tiny dot marker on the specified context. A great debugging aid.
 * @param ctx context
 * @param x dot x coordinate
 * @param y dot y coordinate
 * @param color
 */
export function drawDot(ctx: RenderContext, x: number, y: number, color = '#F55'): void {
  ctx.save();
  ctx.setFillStyle(color);

  // draw a circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
