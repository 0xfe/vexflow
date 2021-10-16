// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2021.
// MIT License

export interface TextMeasure {
  width: number;
  height: number;
}

export interface GroupAttributes {
  pointerBBox: boolean;
}

export abstract class RenderContext {
  abstract clear(): void;
  abstract setFont(family: string, size: number, weight?: string): this;
  abstract setRawFont(font: string): this;
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
    antiClockwise: boolean
  ): this;
  // eslint-disable-next-line
  abstract fill(attributes?: any): this;
  abstract stroke(): this;
  abstract closePath(): this;
  abstract fillText(text: string, x: number, y: number): this;
  abstract save(): this;
  abstract restore(): this;
  // eslint-disable-next-line
  abstract openGroup(cls: string, id?: string, attrs?: GroupAttributes): any;
  abstract closeGroup(): void;
  // eslint-disable-next-line
  abstract add(child: any): void;

  abstract measureText(text: string): TextMeasure;

  abstract set font(value: string);
  abstract get font(): string;
  abstract set fillStyle(style: string | CanvasGradient | CanvasPattern);
  abstract get fillStyle(): string | CanvasGradient | CanvasPattern;
  abstract set strokeStyle(style: string | CanvasGradient | CanvasPattern);
  abstract get strokeStyle(): string | CanvasGradient | CanvasPattern;
}
