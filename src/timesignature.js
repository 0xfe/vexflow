// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Implements time signatures glyphs for staffs
// See tables.js for the internal time signatures
// representation

import { Vex } from './vex';
import { Glyph } from './glyph';
import { StaveModifier } from './stavemodifier';

const assertIsValidFraction = (timeSpec) => {
  const numbers = timeSpec.split('/').filter(number => number !== '');

  if (numbers.length !== 2) {
    throw new Vex.RERR(
      'BadTimeSignature',
      `Invalid time spec: ${timeSpec}. Must be in the form "<numerator>/<denominator>"`
    );
  }

  numbers.forEach(number => {
    if (isNaN(Number(number))) {
      throw new Vex.RERR(
        'BadTimeSignature', `Invalid time spec: ${timeSpec}. Must contain two valid numbers.`
      );
    }
  });
};

export class TimeSignature extends StaveModifier {
  static get CATEGORY() { return 'timesignatures'; }

  static get glyphs() {
    return {
      'C': {
        code: 'v41',
        point: 40,
        line: 2,
      },
      'C|': {
        code: 'vb6',
        point: 40,
        line: 2,
      },
    };
  }

  constructor(timeSpec = null, customPadding = 15, validate_args = true) {
    super();
    this.setAttribute('type', 'TimeSignature');
    this.validate_args = validate_args;

    if (timeSpec === null) return;

    const padding = customPadding;

    this.point = 40;
    this.topLine = 2;
    this.bottomLine = 4;
    this.setPosition(StaveModifier.Position.BEGIN);
    this.setTimeSig(timeSpec);
    this.setWidth(this.timeSig.glyph.getMetrics().width);
    this.setPadding(padding);
  }

  getCategory() { return TimeSignature.CATEGORY; }

  parseTimeSpec(timeSpec) {
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

    const [topDigits, botDigits] = timeSpec
      .split('/')
      .map(number => number.split(''));

    return {
      num: true,
      glyph: this.makeTimeSignatureGlyph(topDigits, botDigits),
    };
  }

  makeTimeSignatureGlyph(topDigits, botDigits) {
    const glyph = new Glyph('v0', this.point);
    glyph.topGlyphs = [];
    glyph.botGlyphs = [];

    let topWidth = 0;
    for (let i = 0; i < topDigits.length; ++i) {
      const num = topDigits[i];
      const topGlyph = new Glyph('v' + num, this.point);

      glyph.topGlyphs.push(topGlyph);
      topWidth += topGlyph.getMetrics().width;
    }

    let botWidth = 0;
    for (let i = 0; i < botDigits.length; ++i) {
      const num = botDigits[i];
      const botGlyph = new Glyph('v' + num, this.point);

      glyph.botGlyphs.push(botGlyph);
      botWidth += botGlyph.getMetrics().width;
    }

    const width = topWidth > botWidth ? topWidth : botWidth;
    const xMin = glyph.getMetrics().x_min;

    glyph.getMetrics = () => ({
      x_min: xMin,
      x_max: xMin + width,
      width,
    });

    const topStartX = (width - topWidth) / 2.0;
    const botStartX = (width - botWidth) / 2.0;

    const that = this;
    glyph.renderToStave = function renderToStave(x) {
      let start_x = x + topStartX;
      for (let i = 0; i < this.topGlyphs.length; ++i) {
        const glyph = this.topGlyphs[i];
        Glyph.renderOutline(
          this.context,
          glyph.metrics.outline,
          glyph.scale,
          start_x + glyph.x_shift,
          this.stave.getYForLine(that.topLine)
        );
        start_x += glyph.getMetrics().width;
      }

      start_x = x + botStartX;
      for (let i = 0; i < this.botGlyphs.length; ++i) {
        const glyph = this.botGlyphs[i];
        that.placeGlyphOnLine(glyph, this.stave, glyph.line);
        Glyph.renderOutline(
          this.context,
          glyph.metrics.outline,
          glyph.scale,
          start_x + glyph.x_shift,
          this.stave.getYForLine(that.bottomLine)
        );
        start_x += glyph.getMetrics().width;
      }
    };

    return glyph;
  }

  getTimeSig() {
    return this.timeSig;
  }

  setTimeSig(timeSpec) {
    this.timeSig = this.parseTimeSpec(timeSpec);
    return this;
  }

  draw() {
    if (!this.x) {
      throw new Vex.RERR('TimeSignatureError', "Can't draw time signature without x.");
    }

    if (!this.stave) {
      throw new Vex.RERR('TimeSignatureError', "Can't draw time signature without stave.");
    }

    this.setRendered();
    this.timeSig.glyph.setStave(this.stave);
    this.timeSig.glyph.setContext(this.stave.context);
    this.placeGlyphOnLine(this.timeSig.glyph, this.stave, this.timeSig.line);
    this.timeSig.glyph.renderToStave(this.x);
  }
}
