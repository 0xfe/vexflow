// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Implements time signatures glyphs for staffs
// See tables.js for the internal time signatures
// representation

import { RuntimeError } from './util';
import { Glyph } from './glyph';
import { StaveModifier } from './stavemodifier';
import { TimeSignatureGlyph } from './timesigglyph';
import { check } from './common';

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
  point: number;
  bottomLine: number;
  topLine: number;

  protected timeSig: TimeSignatureInfo;
  protected validate_args: boolean;

  static get CATEGORY(): string {
    return 'timesignatures';
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

  constructor(timeSpec: string = '4/4', customPadding = 15, validate_args = true) {
    super();
    this.setAttribute('type', 'TimeSignature');
    this.validate_args = validate_args;

    const padding = customPadding;

    this.point = this.musicFont.lookupMetric('digits.point');
    const fontLineShift = this.musicFont.lookupMetric('digits.shiftLine', 0);
    this.topLine = 2 + fontLineShift;
    this.bottomLine = 4 + fontLineShift;
    this.setPosition(StaveModifier.Position.BEGIN);
    this.timeSig = this.parseTimeSpec(timeSpec);
    this.setWidth(check<number>(this.timeSig.glyph.getMetrics().width));
    this.setPadding(padding);
  }

  getCategory(): string {
    return TimeSignature.CATEGORY;
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
    const glyph = new TimeSignatureGlyph(this, topDigits, botDigits, 'timeSig0', this.point);
    return glyph;
  }

  getTimeSig(): TimeSignatureInfo | undefined {
    return this.timeSig;
  }

  setTimeSig(timeSpec: string): this {
    this.timeSig = this.parseTimeSpec(timeSpec);
    return this;
  }

  draw(): void {
    if (!this.x) {
      throw new RuntimeError('TimeSignatureError', "Can't draw time signature without x.");
    }

    if (!this.stave) {
      throw new RuntimeError('TimeSignatureError', "Can't draw time signature without stave.");
    }

    this.setRendered();
    this.timeSig.glyph.setStave(this.stave);
    this.timeSig.glyph.setContext(this.stave.getContext());
    this.placeGlyphOnLine(this.timeSig.glyph, this.stave, this.timeSig.line);
    this.timeSig.glyph.renderToStave(this.x);
  }
}
