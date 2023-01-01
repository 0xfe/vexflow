// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Implements time signatures glyphs for staffs
// See tables.js for the internal time signatures
// representation

import { Glyph } from './glyph';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { TimeSignatureGlyph } from './timesigglyph';
import { Category } from './typeguard';
import { defined, RuntimeError } from './util';

export interface TimeSignatureInfo {
  glyph: Glyph;
  line: number;
  num: boolean;
}

const assertIsValidTimeSig = (timeSpec: string) => {
  const numbers = timeSpec.split('/');

  if (numbers.length !== 2 && numbers[0] !== '+' && numbers[0] !== '-') {
    throw new RuntimeError(
      'BadTimeSignature',
      `Invalid time spec: ${timeSpec}. Must be in the form "<numerator>/<denominator>"`
    );
  }

  numbers.forEach((number) => {
    // Characters consisting in number 0..9, '+', '-', '(' or ')'
    if (/^[0-9+\-()]+$/.test(number) == false) {
      throw new RuntimeError('BadTimeSignature', `Invalid time spec: ${timeSpec}. Must contain valid signatures.`);
    }
  });
};

export class TimeSignature extends StaveModifier {
  static get CATEGORY(): string {
    return Category.TimeSignature;
  }

  static get glyphs(): Record<string, { code: string; point: number; line: number }> {
    return {
      C: {
        code: 'timeSigCommon',
        point: 40,
        line: 2,
      },
      'C|': {
        code: 'timeSigCutCommon',
        point: 40,
        line: 2,
      },
    };
  }

  point: number;
  bottomLine: number;
  topLine: number;

  protected timeSpec: string = '4/4';
  protected line: number = 0;
  protected glyph!: Glyph;
  protected is_numeric: boolean = true;
  protected validate_args: boolean;

  constructor(timeSpec: string = '4/4', customPadding = 15, validate_args = true) {
    super();
    this.validate_args = validate_args;

    const padding = customPadding;

    // point must be defined before parsing spec.
    const musicFont = Tables.currentMusicFont();
    this.point = musicFont.lookupMetric('digits.point');

    const fontLineShift = musicFont.lookupMetric('digits.shiftLine', 0);
    this.topLine = 2 + fontLineShift;
    this.bottomLine = 4 + fontLineShift;
    this.setPosition(StaveModifierPosition.BEGIN);
    this.setTimeSig(timeSpec);
    this.setWidth(defined(this.glyph.getMetrics().width));
    this.setPadding(padding);
  }

  parseTimeSpec(timeSpec: string): TimeSignatureInfo {
    if (timeSpec === 'C' || timeSpec === 'C|') {
      const { line, code, point } = TimeSignature.glyphs[timeSpec];
      return {
        line,
        num: false,
        glyph: new Glyph(code, point),
      };
    }

    if (this.validate_args) {
      assertIsValidTimeSig(timeSpec);
    }

    const parts = timeSpec.split('/');

    return {
      line: 0,
      num: true,
      glyph: this.makeTimeSignatureGlyph(parts[0] ?? '', parts[1] ?? ''),
    };
  }

  makeTimeSignatureGlyph(topDigits: string, botDigits: string): Glyph {
    return new TimeSignatureGlyph(this, topDigits, botDigits, 'timeSig0', this.point);
  }

  /**
   * Returns line, num, glyph -- but these can be accessed directly w/ getters and setters.
   */
  getInfo(): TimeSignatureInfo {
    const { line, is_numeric, glyph } = this;
    return { line, num: is_numeric, glyph };
  }

  /**
   * Set a new time signature specification without changing customPadding, etc.
   *
   * The getter for this is `getTimeSpec` not `getTimeSig`.
   */
  setTimeSig(timeSpec: string): this {
    this.timeSpec = timeSpec;
    const info = this.parseTimeSpec(timeSpec);
    this.glyph = info.glyph;
    this.is_numeric = info.num;
    this.line = info.line;
    return this;
  }

  getTimeSpec(): string {
    return this.timeSpec;
  }

  getLine(): number {
    return this.line;
  }

  setLine(line: number) {
    this.line = line;
  }

  getGlyph(): Glyph {
    return this.glyph;
  }

  setGlyph(glyph: Glyph) {
    this.glyph = glyph;
  }

  getIsNumeric(): boolean {
    return this.is_numeric;
  }

  setIsNumeric(isNumeric: boolean) {
    this.is_numeric = isNumeric;
  }

  draw(): void {
    const stave = this.checkStave();
    const ctx = stave.checkContext();
    this.setRendered();

    this.applyStyle(ctx);
    ctx.openGroup('timesignature', this.getAttribute('id'));
    this.glyph.setStave(stave);
    this.glyph.setContext(ctx);
    this.placeGlyphOnLine(this.glyph, stave, this.line);
    this.glyph.renderToStave(this.x);
    ctx.closeGroup();
    this.restoreStyle(ctx);
  }
}
