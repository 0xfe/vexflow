// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Stave } from './stave';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { TextJustification, TextNote } from './textnote';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export class StaveText extends StaveModifier {
  static get CATEGORY(): string {
    return Category.StaveText;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: 16,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
  };

  protected options: {
    shift_x: number;
    shift_y: number;
    justification: number;
  };

  protected text: string;
  protected shift_x?: number;
  protected shift_y?: number;

  constructor(
    text: string,
    position: number,
    options: { shift_x?: number; shift_y?: number; justification?: number } = {}
  ) {
    super();

    this.setWidth(16);
    this.text = text;
    this.position = position;
    this.options = {
      shift_x: 0,
      shift_y: 0,
      justification: TextNote.Justification.CENTER,
      ...options,
    };

    this.resetFont();
  }

  setStaveText(text: string): this {
    this.text = text;
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

  setText(text: string): this {
    this.text = text;
    return this;
  }

  draw(stave: Stave): this {
    const ctx = stave.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setLineWidth(2);
    ctx.setFont(this.textFont);
    const text_width = ctx.measureText('' + this.text).width;

    let x;
    let y;
    switch (this.position) {
      case StaveModifierPosition.LEFT:
      case StaveModifierPosition.RIGHT:
        y = (stave.getYForLine(0) + stave.getBottomLineY()) / 2 + this.options.shift_y;
        if (this.position === StaveModifierPosition.LEFT) {
          x = stave.getX() - text_width - 24 + this.options.shift_x;
        } else {
          x = stave.getX() + stave.getWidth() + 24 + this.options.shift_x;
        }
        break;
      case StaveModifierPosition.ABOVE:
      case StaveModifierPosition.BELOW:
        x = stave.getX() + this.options.shift_x;
        if (this.options.justification === TextJustification.CENTER) {
          x += stave.getWidth() / 2 - text_width / 2;
        } else if (this.options.justification === TextJustification.RIGHT) {
          x += stave.getWidth() - text_width;
        }

        if (this.position === StaveModifierPosition.ABOVE) {
          y = stave.getYForTopText(2) + this.options.shift_y;
        } else {
          y = stave.getYForBottomText(2) + this.options.shift_y;
        }
        break;
      default:
        throw new RuntimeError('InvalidPosition', 'Value Must be in Modifier.Position.');
    }

    ctx.fillText('' + this.text, x, y + 4);
    ctx.restore();
    return this;
  }
}
