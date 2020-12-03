import {Vex} from './vex';
import {BravuraFont} from './fonts/bravura_glyphs';
import {BravuraMetrics} from './fonts/bravura_metrics';
import {GonvilleFont} from './fonts/gonville_glyphs';
import {GonvilleMetrics} from './fonts/gonville_metrics';
import {PetalumaFont} from './fonts/petaluma_glyphs';
import {PetalumaMetrics} from './fonts/petaluma_metrics';
import {CustomFont} from './fonts/custom_glyphs';
import {CustomMetrics} from './fonts/custom_metrics';
import {IFontData, IFontGlyph} from "./types/font";

class Font {
  name: string;
  metrics: Record<string, any>;

  private readonly fontData: IFontData;

  private codePoints: never;

  constructor(name: string, metrics: Record<string, unknown>, fontData: IFontData) {
    this.name = name;
    this.metrics = metrics;
    this.fontData = fontData;
    this.codePoints = {} as never;
  }

  getName(): string {
    return this.name;
  }

  getResolution(): number {
    return this.fontData.resolution;
  }

  getMetrics(): Record<string, unknown> {
    return this.metrics;
  }

  lookupMetric(key: string, defaultValue: Record<string, any>|number = undefined): any {
    const parts = key.split('.');
    let val: any = this.metrics;
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

  getFontData(): IFontData {
    return this.fontData;
  }

  getGlyphs(): Record<string, IFontGlyph> {
    return this.fontData.glyphs;
  }

  getCodePoints(): never {
    return this.codePoints;
  }

  setCodePoints(codePoints: never): this {
    this.codePoints = codePoints;
    return this;
  }
}

const Fonts = {
  Bravura: new Font('Bravura', BravuraMetrics, BravuraFont as any),
  Gonville: new Font('Gonville', GonvilleMetrics, GonvilleFont as any),
  Petaluma: new Font('Petaluma', PetalumaMetrics, PetalumaFont as any),
  Custom: new Font('Custom', CustomMetrics, CustomFont as any),
};

const DefaultFontStack = [Fonts.Bravura, Fonts.Gonville, Fonts.Custom];

export {Fonts, DefaultFontStack, Font};
