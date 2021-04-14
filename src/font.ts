import { Vex } from './vex';
import { BravuraFont } from './fonts/bravura_glyphs';
import { BravuraMetrics } from './fonts/bravura_metrics';
import { GonvilleFont } from './fonts/gonville_glyphs';
import { GonvilleMetrics } from './fonts/gonville_metrics';
import { PetalumaFont } from './fonts/petaluma_glyphs';
import { PetalumaMetrics } from './fonts/petaluma_metrics';
import { CustomFont } from './fonts/custom_glyphs';
import { CustomMetrics } from './fonts/custom_metrics';

class Font {
  constructor(name, metrics, fontData) {
    this.name = name;
    this.metrics = metrics;
    this.fontData = fontData;
    this.codePoints = {};
  }

  getName() {
    return this.name;
  }

  getResolution() {
    return this.fontData.resolution;
  }

  getMetrics() {
    return this.metrics;
  }

  lookupMetric(key, defaultValue = undefined) {
    const parts = key.split('.');
    let val = this.metrics;
    // console.log('lookupMetric:', key);
    for (let i = 0; i < parts.length; i++) {
      if (val[parts[i]] === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        } else {
          throw new Vex.RERR('INVALID_KEY', `Invalid music font metric key: ${key}`);
        }
      }
      val = val[parts[i]];
    }

    // console.log('found:', key, val);
    return val;
  }

  getFontData() {
    return this.fontData;
  }

  getGlyphs() {
    return this.fontData.glyphs;
  }

  getCodePoints() {
    return this.codePoints;
  }

  setCodePoints(codePoints) {
    this.codePoints = codePoints;
    return this;
  }
}

const Fonts = {
  Bravura: new Font('Bravura', BravuraMetrics, BravuraFont),
  Gonville: new Font('Gonville', GonvilleMetrics, GonvilleFont),
  Petaluma: new Font('Petaluma', PetalumaMetrics, PetalumaFont),
  Custom: new Font('Custom', CustomMetrics, CustomFont),
};

const DefaultFontStack = [Fonts.Bravura, Fonts.Gonville, Fonts.Custom];

export { Fonts, DefaultFontStack, Font };
