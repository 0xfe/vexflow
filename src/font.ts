import { BravuraFont } from './fonts/bravura_glyphs';
import { BravuraMetrics } from './fonts/bravura_metrics';
import { GonvilleFont } from './fonts/gonville_glyphs';
import { GonvilleMetrics } from './fonts/gonville_metrics';
import { PetalumaFont } from './fonts/petaluma_glyphs';
import { PetalumaMetrics } from './fonts/petaluma_metrics';
import { CustomFont } from './fonts/custom_glyphs';
import { CustomMetrics } from './fonts/custom_metrics';
import { RuntimeError } from './util';

export interface FontData {
  glyphs: Record<string, FontGlyph>;
  fontFamily?: string;
  resolution: number;
  generatedOn?: string;
}

export interface FontGlyph {
  x_min: number;
  x_max: number;
  y_min?: number;
  y_max?: number;
  ha: number;
  o: string;
  leftSideBearing?: number;
  advanceWidth?: number;
  cached_outline?: string[];
}

class Font {
  protected name: string;
  // eslint-disable-next-line
  protected metrics: Record<string, any>;
  protected readonly fontData: FontData;

  // eslint-disable-next-line
  constructor(name: string, metrics?: Record<string, any>, fontData?: FontData) {
    this.name = name;
    switch (name) {
      case 'Bravura':
        this.metrics = BravuraMetrics;
        this.fontData = BravuraFont;
        break;
      case 'Gonville':
        this.metrics = GonvilleMetrics;
        this.fontData = GonvilleFont;
        break;
      case 'Petaluma':
        this.metrics = PetalumaMetrics;
        this.fontData = PetalumaFont;
        break;
      case 'Custom':
        this.metrics = CustomMetrics;
        this.fontData = CustomFont;
        break;
      default:
        if (!metrics || !fontData) throw new RuntimeError('Missing metrics or font data');
        this.metrics = metrics;
        this.fontData = fontData;
    }
  }

  getName(): string {
    return this.name;
  }

  getResolution(): number {
    return this.fontData.resolution;
  }

  // eslint-disable-next-line
  getMetrics(): Record<string, any> {
    return this.metrics;
  }

  // eslint-disable-next-line
  lookupMetric(key: string, defaultValue?: Record<string, any> | number): any {
    const parts = key.split('.');
    let val = this.metrics;
    // console.log('lookupMetric:', key);
    for (let i = 0; i < parts.length; i++) {
      if (val[parts[i]] === undefined) {
        return defaultValue;
      }
      val = val[parts[i]];
    }

    // console.log('found:', key, val);
    return val;
  }

  getFontData(): FontData {
    return this.fontData;
  }

  getGlyphs(): Record<string, FontGlyph> {
    return this.fontData.glyphs;
  }
}

const Fonts = {
  Bravura: (): Font => {
    return new Font('Bravura');
  },
  Gonville: (): Font => {
    return new Font('Gonville');
  },
  Petaluma: (): Font => {
    return new Font('Petaluma');
  },
  Custom: (): Font => {
    return new Font('Custom');
  },
};

export { Fonts, Font };
