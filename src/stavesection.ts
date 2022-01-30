// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Larry Kuhns 2011

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
import { Category } from './typeguard';

export class StaveSection extends StaveModifier {
  static get CATEGORY(): string {
    return Category.StaveSection;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SANS_SERIF,
    size: 10,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
  };

  protected section: string;
  protected shift_x: number;
  protected shift_y: number;

  constructor(section: string, x: number, shift_y: number) {
    super();

    this.setWidth(16);
    this.section = section;
    this.x = x;
    this.shift_x = 0;
    this.shift_y = shift_y;
    this.resetFont();
  }

  setStaveSection(section: string): this {
    this.section = section;
    return this;
  }

  setShiftX(x: number): this {
    this.shift_x = x;
    return this;
  }

  setShiftY(y: number): this {
    this.shift_y = y;
    return this;
  }

  draw(stave: Stave, shift_x: number): this {
    const ctx = stave.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setLineWidth(2);
    ctx.setFont(this.textFont);

    const paddingX = 2;
    const paddingY = 2;
    const rectWidth = 2;
    const textMeasurements = ctx.measureText(this.section);
    const textWidth = textMeasurements.width;
    const textHeight = textMeasurements.height;
    const width = textWidth + 2 * paddingX; // add left & right padding
    const height = textHeight + 2 * paddingY; // add top & bottom padding

    //  Seems to be a good default y
    const y = stave.getYForTopText(2) + this.shift_y;
    const x = this.x + shift_x;
    ctx.beginPath();
    ctx.setLineWidth(rectWidth);
    ctx.rect(x, y + textMeasurements.y - paddingY, width, height);
    ctx.stroke();
    ctx.fillText(this.section, x + paddingX, y);
    ctx.restore();
    return this;
  }
}
