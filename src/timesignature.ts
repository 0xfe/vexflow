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

/**
 * A TimeSignature is a StaveModifier that can make its appropriate Glyphs directly from
 * a provided "timeSpec" such as "4/4", "C|" (cut time), or even something more advanced
 * such as "3/4(6/8)" or "2/4+5/8".
 */
export class TimeSignature extends StaveModifier {
  static get CATEGORY(): string {
    return Category.TimeSignature;
  }

  static get glyphs(): Record<string, { code: string; line: number }> {
    return {
      C: {
        code: 'timeSigCommon',
        line: 2,
      },
      'C|': {
        code: 'timeSigCutCommon',
        line: 2,
      },
    };
  }

  point: number;
  bottomLine: number; // bottomLine and topLine are used to calculate the position of the
  topLine: number; // top row of digits in a numeric TimeSignature.

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
    this.point = musicFont.lookupMetric('digits.point') || Tables.NOTATION_FONT_SCALE;

    const fontLineShift = musicFont.lookupMetric('digits.shiftLine', 0);
    this.topLine = 2 + fontLineShift;
    this.bottomLine = 4 + fontLineShift;
    this.setPosition(StaveModifierPosition.BEGIN);
    this.setTimeSig(timeSpec);
    this.setPadding(padding);
  }

  /**
   * Return TimeSignatureInfo given a string, consisting of line (number),
   * num (boolean: same as TimeSignature.getIsNumeric()), and glyph (a Glyph or
   * TimeSignatureGlyph object).
   */
  parseTimeSpec(timeSpec: string): TimeSignatureInfo {
    if (timeSpec === 'C' || timeSpec === 'C|') {
      const { line, code } = TimeSignature.glyphs[timeSpec];
      return {
        line,
        num: false,
        glyph: new Glyph(code, Tables.NOTATION_FONT_SCALE),
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

  /**
   * Returns a new TimeSignatureGlyph (a Glyph subclass that knows how to draw both
   * top and bottom digits along with plus signs etc.)
   */
  makeTimeSignatureGlyph(topDigits: string, botDigits: string): TimeSignatureGlyph {
    // note that 'code' is ignored by TimeSignatureGlyph when rendering.
    return new TimeSignatureGlyph(this, topDigits, botDigits, 'timeSig0', this.point);
  }

  /**
   * Returns {line, num (=getIsNumeric), glyph} --
   * but these can also be accessed directly w/ getters and setters.
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
    this.setGlyph(info.glyph);
    this.is_numeric = info.num;
    this.line = info.line;
    return this;
  }

  /**
   * Return the timeSpec (such as '4/4' or 'C|' or even '2/4+3/8') of the TimeSignature
   */
  getTimeSpec(): string {
    return this.timeSpec;
  }

  /**
   * Return the staff line that the TimeSignature sits on.  Generally 0 for numerator/
   * denominator time signatures such as 3/4 and 2 for cut/common.
   */
  getLine(): number {
    return this.line;
  }

  /**
   * Set the line number that the TimeSignature sits on.  Half-values are acceptable
   * for spaces, etc. Can be altered, for instance, for signatures that sit above the
   * staff in large orchestral scores.
   */
  setLine(line: number) {
    this.line = line;
  }

  /**
   * Get the Glyph object used to create the time signature.  Numeric time signatures
   * such as 3/8 have a composite Glyph stored as a single Glyph object.
   */
  getGlyph(): Glyph {
    return this.glyph;
  }

  /**
   * Set the Glyph object used to draw the time signature, and update the width of the
   * TimeSignature to match.  The Glyph must define width in its metrics.
   */
  setGlyph(glyph: Glyph) {
    this.glyph = glyph;
    this.setWidth(defined(this.glyph.getMetrics().width));
  }

  /**
   * Return a boolean on whether this TimeSignature is drawn with one or more numbers
   * (such as 4/4) or not (as in cut time).
   */
  getIsNumeric(): boolean {
    return this.is_numeric;
  }

  /**
   * Set whether this TimeSignature is drawn with one or more numbers.
   */
  setIsNumeric(isNumeric: boolean) {
    this.is_numeric = isNumeric;
  }

  /**
   * Draw the time signature on a Stave using its RenderContext.  Both setStave
   * and setContext must already be run.
   */
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
