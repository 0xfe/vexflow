// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Larry Kuhns 2011

import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
import { FontInfo } from './types/common';

export class StaveSection extends StaveModifier {
  static get CATEGORY(): string {
    return 'StaveSection';
  }

  protected section: string;
  protected shift_x: number;
  protected shift_y: number;
  protected font: FontInfo;

  constructor(section: string, x: number, shift_y: number) {
    super();

    this.setWidth(16);
    this.section = section;
    this.x = x;
    this.shift_x = 0;
    this.shift_y = shift_y;
    this.font = {
      family: 'sans-serif',
      size: 12,
      weight: 'bold',
    };
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
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    const text_width = ctx.measureText('' + this.section).width;
    let width = text_width + 6; // add left & right padding
    if (width < 18) width = 18;
    const height = 20;
    //  Seems to be a good default y
    const y = stave.getYForTopText(3) + this.shift_y;
    let x = this.x + shift_x;
    ctx.beginPath();
    ctx.setLineWidth(2);
    ctx.rect(x, y, width, height);
    ctx.stroke();
    x += (width - text_width) / 2;
    ctx.fillText('' + this.section, x, y + 16);
    ctx.restore();
    return this;
  }
}
