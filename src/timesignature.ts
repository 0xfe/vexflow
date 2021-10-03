// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Implements time signatures glyphs for staffs
// See tables.js for the internal time signatures
// representation

import { RuntimeError, defined } from './util';
import { Glyph } from './glyph';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { TimeSignatureGlyph } from './timesigglyph';

export interface TimeSignatureInfo {
  glyph: Glyph;
  line?: number;
  num: boolean;
}

const assertIsValidFraction = (timeSpec: string) => {
  const numbers = timeSpec.split('/').filter((number) => number !== '');

  if (numbers.length !== 2) {
    throw new RuntimeError(
      'BadTimeSignature',
      `Invalid time spec: ${timeSpec}. Must be in the form "<numerator>/<denominator>"`
    );
  }

  numbers.forEach((number) => {
    if (isNaN(Number(number))) {
      throw new RuntimeError('BadTimeSignature', `Invalid time spec: ${timeSpec}. Must contain two valid numbers.`);
    }
  });
};

export class TimeSignature extends StaveModifier {
  static get CATEGORY(): string {
    return 'TimeSignature';
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

  protected info: TimeSignatureInfo;
  protected validate_args: boolean;

  constructor(timeSpec: string = '4/4', customPadding = 15, validate_args = true) {
    super();
    this.validate_args = validate_args;

    const padding = customPadding;

    this.point = this.musicFont.lookupMetric('digits.point');
    const fontLineShift = this.musicFont.lookupMetric('digits.shiftLine', 0);
    this.topLine = 2 + fontLineShift;
    this.bottomLine = 4 + fontLineShift;
    this.setPosition(StaveModifierPosition.BEGIN);
    this.info = this.parseTimeSpec(timeSpec);
    this.setWidth(defined(this.info.glyph.getMetrics().width));
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
      assertIsValidFraction(timeSpec);
    }

    const [topDigits, botDigits] = timeSpec.split('/').map((number) => number.split(''));

    return {
      num: true,
      glyph: this.makeTimeSignatureGlyph(topDigits, botDigits),
    };
  }

  makeTimeSignatureGlyph(topDigits: string[], botDigits: string[]): Glyph {
    return new TimeSignatureGlyph(this, topDigits, botDigits, 'timeSig0', this.point);
  }

  getInfo(): TimeSignatureInfo {
    return this.info;
  }

  setTimeSig(timeSpec: string): this {
    this.info = this.parseTimeSpec(timeSpec);
    return this;
  }

  draw(): void {
    const stave = this.checkStave();

    this.setRendered();
    this.info.glyph.setStave(stave);
    this.info.glyph.setContext(stave.getContext());
    this.placeGlyphOnLine(this.info.glyph, stave, this.info.line);
    this.info.glyph.renderToStave(this.x);
  }
}
