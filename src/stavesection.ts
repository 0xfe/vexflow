// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Larry Kuhns 2011

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
import { TextFormatter } from './textformatter';
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
  protected drawRect: boolean;

  constructor(section: string, x: number, shift_y: number, drawRect = true) {
    super();

    this.setWidth(16);
    this.section = section;
    this.x = x;
    this.shift_x = 0;
    this.shift_y = shift_y;
    this.drawRect = drawRect;
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
    const borderWidth = 2;
    const padding = 2;
    const ctx = stave.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setLineWidth(borderWidth);
    ctx.setFont(this.textFont);
    const textFormatter = TextFormatter.create(this.textFont);

    const textWidth = textFormatter.getWidthForTextInPx(this.section);
    const textY = textFormatter.getYForStringInPx(this.section);
    const textHeight = textY.height;
    const headroom = -1 * textY.yMin;
    const width = textWidth + 2 * padding; // add left & right padding
    const height = textHeight + 2 * padding; // add top & bottom padding

    //  Seems to be a good default y
    const y = stave.getYForTopText(1.5) + this.shift_y;
    const x = this.x + shift_x;
    if (this.drawRect) {
      ctx.beginPath();
      ctx.rect(x, y - height + headroom, width, height);
      ctx.stroke();
    }
    ctx.fillText(this.section, x + padding, y - padding);
    ctx.restore();
    return this;
  }
}
