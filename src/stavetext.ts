// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
import {StaveModifier} from './stavemodifier';
import {TextNote} from './textnote';
import {Stave} from "./stave";
import {IFont} from "./types/font";
import {IStaveTextOptions} from "./types/stave";
import {RuntimeError} from "./runtimeerror";
import {Merge} from "./flow";

export class StaveText extends StaveModifier {
  private readonly options: IStaveTextOptions;
  private readonly font: IFont;

  private text: string;
  private shift_x: number;
  private shift_y: number;

  static get CATEGORY(): string {
    return 'stavetext';
  }

  constructor(text: string, position: number, options: IStaveTextOptions) {
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
    Merge(this.options, options);

    this.font = {
      family: 'times',
      size: 16,
      weight: 'normal',
    } as IFont;
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

  setFont(font: IFont): void {
    Merge(this.font, font);
  }

  setText(text: string): void {
    this.text = text;
  }

  draw(stave?: Stave): this {
    const ctx = stave.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setLineWidth(2); //ctx.lineWidth = 2;
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
        throw new RuntimeError('InvalidPosition', 'Value Must be in Modifier.Position.');
    }

    ctx.fillText('' + this.text, x, y + 4);
    ctx.restore();
    return this;
  }
}
