// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Author Larry Kuhns 2011

import { Stave } from './stave';
import { LayoutMetrics, StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { Category } from './typeguard';

export enum BarlineType {
  SINGLE = 1,
  DOUBLE = 2,
  END = 3,
  REPEAT_BEGIN = 4,
  REPEAT_END = 5,
  REPEAT_BOTH = 6,
  NONE = 7,
}

export class Barline extends StaveModifier {
  static get CATEGORY(): string {
    return Category.Barline;
  }

  protected widths: Record<string, number>;
  protected paddings: Record<string, number>;
  protected layoutMetricsMap: Record<number, LayoutMetrics>;

  protected thickness: number;
  protected type!: BarlineType;

  static get type(): typeof BarlineType {
    return BarlineType;
  }

  static get typeString(): Record<string, BarlineType> {
    return {
      single: BarlineType.SINGLE,
      double: BarlineType.DOUBLE,
      end: BarlineType.END,
      repeatBegin: BarlineType.REPEAT_BEGIN,
      repeatEnd: BarlineType.REPEAT_END,
      repeatBoth: BarlineType.REPEAT_BOTH,
      none: BarlineType.NONE,
    };
  }

  constructor(type: BarlineType | string) {
    super();
    this.thickness = Tables.STAVE_LINE_THICKNESS;

    const TYPE = BarlineType;
    this.widths = {};
    this.widths[TYPE.SINGLE] = 5;
    this.widths[TYPE.DOUBLE] = 5;
    this.widths[TYPE.END] = 5;
    this.widths[TYPE.REPEAT_BEGIN] = 5;
    this.widths[TYPE.REPEAT_END] = 5;
    this.widths[TYPE.REPEAT_BOTH] = 5;
    this.widths[TYPE.NONE] = 5;

    this.paddings = {};
    this.paddings[TYPE.SINGLE] = 0;
    this.paddings[TYPE.DOUBLE] = 0;
    this.paddings[TYPE.END] = 0;
    this.paddings[TYPE.REPEAT_BEGIN] = 15;
    this.paddings[TYPE.REPEAT_END] = 15;
    this.paddings[TYPE.REPEAT_BOTH] = 15;
    this.paddings[TYPE.NONE] = 0;

    this.layoutMetricsMap = {};
    this.layoutMetricsMap[TYPE.SINGLE] = {
      xMin: 0,
      xMax: 1,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.layoutMetricsMap[TYPE.DOUBLE] = {
      xMin: -3,
      xMax: 1,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.layoutMetricsMap[TYPE.END] = {
      xMin: -5,
      xMax: 1,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.layoutMetricsMap[TYPE.REPEAT_END] = {
      xMin: -10,
      xMax: 1,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.layoutMetricsMap[TYPE.REPEAT_BEGIN] = {
      xMin: -2,
      xMax: 10,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.layoutMetricsMap[TYPE.REPEAT_BOTH] = {
      xMin: -10,
      xMax: 10,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.layoutMetricsMap[TYPE.NONE] = {
      xMin: 0,
      xMax: 0,
      paddingLeft: 5,
      paddingRight: 5,
    };
    this.setPosition(StaveModifierPosition.BEGIN);
    this.setType(type);
  }

  getType(): number {
    return this.type;
  }

  setType(type: string | number): this {
    this.type = typeof type === 'string' ? Barline.typeString[type] : type;

    this.setWidth(this.widths[this.type]);
    this.setPadding(this.paddings[this.type]);
    this.setLayoutMetrics(this.layoutMetricsMap[this.type]);
    return this;
  }

  // Draw barlines
  draw(stave: Stave): void {
    const ctx = stave.checkContext();
    this.setRendered();

    this.applyStyle(ctx);
    ctx.openGroup('stavebarline', this.getAttribute('id'));
    switch (this.type) {
      case BarlineType.SINGLE:
        this.drawVerticalBar(stave, this.x, false);
        break;
      case BarlineType.DOUBLE:
        this.drawVerticalBar(stave, this.x, true);
        break;
      case BarlineType.END:
        this.drawVerticalEndBar(stave, this.x);
        break;
      case BarlineType.REPEAT_BEGIN:
        // If the barline is shifted over (in front of clef/time/key)
        // Draw vertical bar at the beginning.
        this.drawRepeatBar(stave, this.x, true);
        if (stave.getX() !== this.x) {
          this.drawVerticalBar(stave, stave.getX());
        }

        break;
      case BarlineType.REPEAT_END:
        this.drawRepeatBar(stave, this.x, false);
        break;
      case BarlineType.REPEAT_BOTH:
        this.drawRepeatBar(stave, this.x, false);
        this.drawRepeatBar(stave, this.x, true);
        break;
      default:
        // Default is NONE, so nothing to draw
        break;
    }
    ctx.closeGroup();
    this.restoreStyle(ctx);
  }

  drawVerticalBar(stave: Stave, x: number, double_bar?: boolean): void {
    const staveCtx = stave.checkContext();
    const topY = stave.getTopLineTopY();
    const botY = stave.getBottomLineBottomY();
    if (double_bar) {
      staveCtx.fillRect(x - 3, topY, 1, botY - topY);
    }
    staveCtx.fillRect(x, topY, 1, botY - topY);
  }

  drawVerticalEndBar(stave: Stave, x: number): void {
    const staveCtx = stave.checkContext();
    const topY = stave.getTopLineTopY();
    const botY = stave.getBottomLineBottomY();
    staveCtx.fillRect(x - 5, topY, 1, botY - topY);
    staveCtx.fillRect(x - 2, topY, 3, botY - topY);
  }

  drawRepeatBar(stave: Stave, x: number, begin: boolean): void {
    const staveCtx = stave.checkContext();

    const topY = stave.getTopLineTopY();
    const botY = stave.getBottomLineBottomY();
    let x_shift = 3;

    if (!begin) {
      x_shift = -5;
    }

    staveCtx.fillRect(x + x_shift, topY, 1, botY - topY);
    staveCtx.fillRect(x - 2, topY, 3, botY - topY);

    const dot_radius = 2;

    // Shift dots left or right
    if (begin) {
      x_shift += 4;
    } else {
      x_shift -= 4;
    }

    const dot_x = x + x_shift + dot_radius / 2;

    // calculate the y offset based on number of stave lines
    let y_offset = (stave.getNumLines() - 1) * stave.getSpacingBetweenLines();
    y_offset = y_offset / 2 - stave.getSpacingBetweenLines() / 2;
    let dot_y = topY + y_offset + dot_radius / 2;

    // draw the top repeat dot
    staveCtx.beginPath();
    staveCtx.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
    staveCtx.fill();

    // draw the bottom repeat dot
    dot_y += stave.getSpacingBetweenLines();
    staveCtx.beginPath();
    staveCtx.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
    staveCtx.fill();
  }
}
