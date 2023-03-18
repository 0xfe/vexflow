// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Renders time signatures glyphs for staffs
// This class is used by TimeSignature to render the associated glyphs

import { Glyph, GlyphMetrics } from './glyph';
import { TimeSignature } from './timesignature';
import { defined } from './util';

export class TimeSignatureGlyph extends Glyph {
  timeSignature: TimeSignature;
  topStartX: number;
  botStartX: number;
  width: number;
  lineShift: number;
  xMin: number;

  constructor(
    timeSignature: TimeSignature,
    topDigits: string,
    botDigits: string,
    code: string,
    point: number,
    options?: { category: string }
  ) {
    super(code, point, options);
    this.timeSignature = timeSignature;
    this.topGlyphs = [];
    this.botGlyphs = [];

    let topWidth = 0;
    let height = 0;
    for (let i = 0; i < topDigits.length; ++i) {
      let timeSigType = topDigits[i];
      switch (topDigits[i]) {
        case '-':
          timeSigType = 'Minus';
          break;
        case '+':
          timeSigType = botDigits.length > 0 ? 'PlusSmall' : 'Plus';
          break;
        case '(':
          timeSigType = botDigits.length > 0 ? 'ParensLeftSmall' : 'ParensLeft';
          break;
        case ')':
          timeSigType = botDigits.length > 0 ? 'ParensRightSmall' : 'ParensRight';
          break;
      }
      const topGlyph = new Glyph('timeSig' + timeSigType, this.timeSignature.point);

      this.topGlyphs.push(topGlyph);
      topWidth += topGlyph.getMetrics().width ?? 0;
      height = Math.max(height, topGlyph.getMetrics().height);
    }

    let botWidth = 0;
    for (let i = 0; i < botDigits.length; ++i) {
      let timeSigType = botDigits[i];
      switch (botDigits[i]) {
        case '+':
          timeSigType = 'PlusSmall';
          break;
        case '(':
          timeSigType = 'ParensLeftSmall';
          break;
        case ')':
          timeSigType = 'ParensRightSmall';
          break;
      }
      const botGlyph = new Glyph('timeSig' + timeSigType, this.timeSignature.point);

      this.botGlyphs.push(botGlyph);
      botWidth += defined(botGlyph.getMetrics().width);
      height = Math.max(height, botGlyph.getMetrics().height);
    }

    // If the height of the digits is more than two staff spaces (20), shift to the next line
    // in order to center the digits on lines 1 and 5 rather than 2 and 4.
    this.lineShift = height > 22 ? 1 : 0;

    this.width = Math.max(topWidth, botWidth);
    this.xMin = this.getMetrics().x_min;
    this.topStartX = (this.width - topWidth) / 2.0;
    this.botStartX = (this.width - botWidth) / 2.0;
    this.reset();
  }

  getMetrics(): GlyphMetrics {
    return {
      x_min: this.xMin,
      x_max: this.xMin + this.width,
      width: this.width,
    } as GlyphMetrics;
  }

  renderToStave(x: number): void {
    const stave = this.checkStave();
    const ctx = this.checkContext();

    let start_x = x + this.topStartX;
    let y = 0;
    if (this.botGlyphs.length > 0) y = stave.getYForLine(this.timeSignature.topLine - this.lineShift);
    else y = (stave.getYForLine(this.timeSignature.topLine) + stave.getYForLine(this.timeSignature.bottomLine)) / 2;
    for (let i = 0; i < this.topGlyphs.length; ++i) {
      const glyph = this.topGlyphs[i];
      Glyph.renderOutline(ctx, glyph.getMetrics().outline, this.scale, start_x + this.x_shift, y);
      start_x += defined(glyph.getMetrics().width);
    }

    start_x = x + this.botStartX;
    y = stave.getYForLine(this.timeSignature.bottomLine + this.lineShift);
    for (let i = 0; i < this.botGlyphs.length; ++i) {
      const glyph = this.botGlyphs[i];
      this.timeSignature.placeGlyphOnLine(glyph, stave, this.timeSignature.getLine());
      Glyph.renderOutline(ctx, glyph.getMetrics().outline, this.scale, start_x + glyph.getMetrics().x_shift, y);
      start_x += defined(glyph.getMetrics().width);
    }
  }
}
