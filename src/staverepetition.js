// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Larry Kuhns 2011

import { StaveModifier } from './stavemodifier';
import { Glyph } from './glyph';

export class Repetition extends StaveModifier {
  static get CATEGORY() { return 'repetitions'; }
  static get type() {
    return {
      NONE: 1,         // no coda or segno
      CODA_LEFT: 2,    // coda at beginning of stave
      CODA_RIGHT: 3,   // coda at end of stave
      SEGNO_LEFT: 4,   // segno at beginning of stave
      SEGNO_RIGHT: 5,  // segno at end of stave
      DC: 6,           // D.C. at end of stave
      DC_AL_CODA: 7,   // D.C. al coda at end of stave
      DC_AL_FINE: 8,   // D.C. al Fine end of stave
      DS: 9,           // D.S. at end of stave
      DS_AL_CODA: 10,  // D.S. al coda at end of stave
      DS_AL_FINE: 11,  // D.S. al Fine at end of stave
      FINE: 12,        // Fine at end of stave
    };
  }

  constructor(type, x, y_shift) {
    super();
    this.setAttribute('type', 'Repetition');

    this.symbol_type = type;
    this.x = x;
    this.x_shift = 0;
    this.y_shift = y_shift;
    this.font = {
      family: 'times',
      size: 12,
      weight: 'bold italic',
    };
  }

  getCategory() { return Repetition.CATEGORY; }
  setShiftX(x) { this.x_shift = x; return this; }
  setShiftY(y) { this.y_shift = y; return this; }

  draw(stave, x) {
    this.setRendered();

    switch (this.symbol_type) {
      case Repetition.type.CODA_RIGHT:
        this.drawCodaFixed(stave, x + stave.width);
        break;
      case Repetition.type.CODA_LEFT:
        this.drawSymbolText(stave, x, 'Coda', true);
        break;
      case Repetition.type.SEGNO_LEFT:
        this.drawSignoFixed(stave, x);
        break;
      case Repetition.type.SEGNO_RIGHT:
        this.drawSignoFixed(stave, x + stave.width);
        break;
      case Repetition.type.DC:
        this.drawSymbolText(stave, x, 'D.C.', false);
        break;
      case Repetition.type.DC_AL_CODA:
        this.drawSymbolText(stave, x, 'D.C. al', true);
        break;
      case Repetition.type.DC_AL_FINE:
        this.drawSymbolText(stave, x, 'D.C. al Fine', false);
        break;
      case Repetition.type.DS:
        this.drawSymbolText(stave, x, 'D.S.', false);
        break;
      case Repetition.type.DS_AL_CODA:
        this.drawSymbolText(stave, x, 'D.S. al', true);
        break;
      case Repetition.type.DS_AL_FINE:
        this.drawSymbolText(stave, x, 'D.S. al Fine', false);
        break;
      case Repetition.type.FINE:
        this.drawSymbolText(stave, x, 'Fine', false);
        break;
      default:
        break;
    }

    return this;
  }

  drawCodaFixed(stave, x) {
    const y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
    Glyph.renderGlyph(stave.context, this.x + x + this.x_shift, y + 25, 40, 'coda', { category: 'coda' });
    return this;
  }

  drawSignoFixed(stave, x) {
    const y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
    Glyph.renderGlyph(stave.context, this.x + x + this.x_shift, y + 25, 30, 'segno', { category: 'segno' });
    return this;
  }

  drawSymbolText(stave, x, text, draw_coda) {
    const ctx = stave.checkContext();

    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    // Default to right symbol
    let text_x = 0 + this.x_shift;
    let symbol_x = x + this.x_shift;
    if (this.symbol_type === Repetition.type.CODA_LEFT) {
      // Offset Coda text to right of stave beginning
      text_x = this.x + stave.options.vertical_bar_width;
      symbol_x = text_x + ctx.measureText(text).width + 12;
    } else if (this.symbol_type === Repetition.type.DS) {
      const modifierWidth = stave.start_x - this.x;
      text_x = this.x + x + this.x_shift + stave.width - 5 - modifierWidth - ctx.measureText(text).width;
      // TODO this is weird. setting the x position should probably be refactored, parameters aren't clear here.
    } else {
      // Offset Signo text to left stave end
      symbol_x = this.x + x + stave.width - 5 + this.x_shift;
      text_x = symbol_x - + ctx.measureText(text).width - 12;
    }

    const y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
    if (draw_coda) {
      Glyph.renderGlyph(ctx, symbol_x, y, 40, 'coda', { category: 'coda' });
    }

    ctx.fillText(text, text_x, y + 5);
    ctx.restore();

    return this;
  }
}
