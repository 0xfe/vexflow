// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Larry Kuhns 2011

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
import { Tables } from './tables';
import { Category } from './typeguard';

export class Repetition extends StaveModifier {
  static get CATEGORY(): string {
    return Category.Repetition;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: 12,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
  };

  static readonly type = {
    NONE: 1, // no coda or segno
    CODA_LEFT: 2, // coda at beginning of stave
    CODA_RIGHT: 3, // coda at end of stave
    SEGNO_LEFT: 4, // segno at beginning of stave
    SEGNO_RIGHT: 5, // segno at end of stave
    DC: 6, // D.C. at end of stave
    DC_AL_CODA: 7, // D.C. al coda at end of stave
    DC_AL_FINE: 8, // D.C. al Fine end of stave
    DS: 9, // D.S. at end of stave
    DS_AL_CODA: 10, // D.S. al coda at end of stave
    DS_AL_FINE: 11, // D.S. al Fine at end of stave
    FINE: 12, // Fine at end of stave
    TO_CODA: 13, // To Coda at end of stave
  };

  protected symbol_type: number;

  protected x_shift: number;
  protected y_shift: number;

  constructor(type: number, x: number, y_shift: number) {
    super();

    this.symbol_type = type;
    this.x = x;
    this.x_shift = 0;
    this.y_shift = y_shift;

    this.resetFont();
  }

  setShiftX(x: number): this {
    this.x_shift = x;
    return this;
  }

  setShiftY(y: number): this {
    this.y_shift = y;
    return this;
  }

  draw(stave: Stave, x: number): this {
    this.setRendered();

    switch (this.symbol_type) {
      case Repetition.type.CODA_RIGHT:
        this.drawCodaFixed(stave, x + stave.getWidth());
        break;
      case Repetition.type.CODA_LEFT:
        this.drawSymbolText(stave, x, 'Coda', true);
        break;
      case Repetition.type.SEGNO_LEFT:
        this.drawSignoFixed(stave, x);
        break;
      case Repetition.type.SEGNO_RIGHT:
        this.drawSignoFixed(stave, x + stave.getWidth());
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
      case Repetition.type.TO_CODA:
        this.drawSymbolText(stave, x, 'To', true);
        break;
      default:
        break;
    }

    return this;
  }

  drawCodaFixed(stave: Stave, x: number): this {
    const y = stave.getYForTopText(stave.getNumLines()) + this.y_shift;
    Glyph.renderGlyph(
      stave.checkContext(),
      this.x + x + this.x_shift,
      y + Tables.currentMusicFont().lookupMetric('staveRepetition.coda.offsetY'),
      40,
      'coda',
      { category: 'coda' }
    );
    return this;
  }

  drawSignoFixed(stave: Stave, x: number): this {
    const y = stave.getYForTopText(stave.getNumLines()) + this.y_shift;
    Glyph.renderGlyph(
      stave.checkContext(),
      this.x + x + this.x_shift,
      y + Tables.currentMusicFont().lookupMetric('staveRepetition.segno.offsetY'),
      30,
      'segno',
      { category: 'segno' }
    );
    return this;
  }

  drawSymbolText(stave: Stave, x: number, text: string, draw_coda: boolean): this {
    const ctx = stave.checkContext();

    ctx.save();
    ctx.setFont(this.textFont);

    let text_x = 0;
    let symbol_x = 0;
    const modifierWidth = stave.getNoteStartX() - this.x;
    switch (this.symbol_type) {
      // To the left with symbol
      case Repetition.type.CODA_LEFT:
        // Offset Coda text to right of stave beginning
        text_x = this.x + stave.getVerticalBarWidth();
        symbol_x =
          text_x +
          ctx.measureText(text).width +
          Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetX');
        break;
      // To the right without symbol
      case Repetition.type.DC:
      case Repetition.type.DC_AL_FINE:
      case Repetition.type.DS:
      case Repetition.type.DS_AL_FINE:
      case Repetition.type.FINE:
        text_x =
          this.x +
          x +
          this.x_shift +
          stave.getWidth() -
          Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.spacing') -
          modifierWidth -
          ctx.measureText(text).width;
        break;
      // To the right with symbol
      default:
        text_x =
          this.x +
          x +
          this.x_shift +
          stave.getWidth() -
          Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.spacing') -
          modifierWidth -
          ctx.measureText(text).width -
          Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetX');
        symbol_x =
          text_x +
          ctx.measureText(text).width +
          Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetX');
        break;
    }

    const y =
      stave.getYForTopText(stave.getNumLines()) +
      this.y_shift +
      Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetY');
    if (draw_coda) {
      Glyph.renderGlyph(ctx, symbol_x, y, 40, 'coda', { category: 'coda' });
    }

    ctx.fillText(text, text_x, y + 5);
    ctx.restore();

    return this;
  }
}
