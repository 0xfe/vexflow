// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014

import { Vex } from './vex';
import { StaveModifier } from './stavemodifier';
import { TextNote } from './textnote';
import { FontInfo } from './types/common';
import { Stave } from './stave';

export class StaveText extends StaveModifier {
  protected options: {
    shift_x: number;
    shift_y: number;
    justification: number;
  };
  protected font: FontInfo;

  protected text: string;
  protected shift_x?: number;
  protected shift_y?: number;

  static get CATEGORY(): string {
    return 'stavetext';
  }

  constructor(
    text: string,
    position: number,
    options: {
      shift_x: number;
      shift_y: number;
      justification: number;
    }
  ) {
    super();
    this.setAttribute('type', 'StaveText');

    this.setWidth(16);
    this.text = text;
    this.position = position;
    this.options = {
      shift_x: 0,
      shift_y: 0,
      justification: TextNote.Justification.CENTER,
    };
    Vex.Merge(this.options, options);

    this.font = {
      family: 'times',
      size: 16,
      weight: 'normal',
    };
  }

  getCategory(): string {
    return StaveText.CATEGORY;
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

  setFont(font: FontInfo): this {
    this.font = { ...this.font, ...font };
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
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    const text_width = ctx.measureText('' + this.text).width;

    let x;
    let y;
    const Position = StaveModifier.Position;
    const Justification = TextNote.Justification;
    switch (this.position) {
      case Position.LEFT:
      case Position.RIGHT:
        y = (stave.getYForLine(0) + stave.getBottomLineY()) / 2 + this.options.shift_y;
        if (this.position === Position.LEFT) {
          x = stave.getX() - text_width - 24 + this.options.shift_x;
        } else {
          x = stave.getX() + stave.getWidth() + 24 + this.options.shift_x;
        }
        break;
      case Position.ABOVE:
      case Position.BELOW:
        x = stave.getX() + this.options.shift_x;
        if (this.options.justification === Justification.CENTER) {
          x += stave.getWidth() / 2 - text_width / 2;
        } else if (this.options.justification === Justification.RIGHT) {
          x += stave.getWidth() - text_width;
        }

        if (this.position === Position.ABOVE) {
          y = stave.getYForTopText(2) + this.options.shift_y;
        } else {
          y = stave.getYForBottomText(2) + this.options.shift_y;
        }
        break;
      default:
        throw new Vex.RERR('InvalidPosition', 'Value Must be in Modifier.Position.');
    }

    ctx.fillText('' + this.text, x, y + 4);
    ctx.restore();
    return this;
  }
}
