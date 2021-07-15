import { RuntimeError, log } from './util';
import { loadBravura } from '@bravura';
import { loadGonville } from '@gonville';
import { loadPetaluma } from '@petaluma';
import { loadCustom } from '@custom';

export interface FontData {
  glyphs: Record<string, FontGlyph>;
  fontFamily?: string;
  resolution: number;
  generatedOn?: string;
}

export interface FontDataMetrics {
  fontData?: FontData;
  // eslint-disable-next-line
  metrics?: Record<string, any>;
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
  protected fontDataMetrics: FontDataMetrics;

  // eslint-disable-next-line
  constructor(name: string, metrics?: Record<string, any>, fontData?: FontData) {
    this.name = name;
    this.fontDataMetrics = { fontData: undefined, metrics: undefined };
    switch (name) {
      case 'Bravura':
        loadBravura(this.fontDataMetrics);
        break;
      case 'Custom':
        loadCustom(this.fontDataMetrics);
        break;
      case 'Gonville':
        loadGonville(this.fontDataMetrics);
        break;
      case 'Petaluma':
        loadPetaluma(this.fontDataMetrics);
        break;
      default:
        this.fontDataMetrics.metrics = metrics;
        this.fontDataMetrics.fontData = fontData;
    }
  }

  getName(): string {
    return this.name;
  }

  getResolution(): number {
    if (!this.fontDataMetrics.fontData) throw new RuntimeError('Missing metrics or font data');
    return this.fontDataMetrics.fontData.resolution;
  }

  // eslint-disable-next-line
  getMetrics(): Record<string, any> {
    if (!this.fontDataMetrics.metrics) throw new RuntimeError('Missing metrics or font data');
    return this.fontDataMetrics.metrics;
  }

  // eslint-disable-next-line
  lookupMetric(key: string, defaultValue?: Record<string, any> | number): any {
    if (!this.fontDataMetrics.metrics) throw new RuntimeError('Missing metrics or font data');
    const parts = key.split('.');
    let val = this.fontDataMetrics.metrics;
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
    if (!this.fontDataMetrics.fontData) throw new RuntimeError('Missing metrics or font data');
    return this.fontDataMetrics.fontData;
  }

  getGlyphs(): Record<string, FontGlyph> {
    if (!this.fontDataMetrics.fontData) throw new RuntimeError('Missing metrics or font data');
    return this.fontDataMetrics.fontData.glyphs;
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
