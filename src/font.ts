import { RuntimeError } from './util';
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
  protected metrics?: Record<string, any>;
  protected fontData?: FontData;

  // eslint-disable-next-line
  constructor(name: string, metrics?: Record<string, any>, fontData?: FontData) {
    this.name = name;
    switch (name) {
      case 'Bravura':
        // eslint-disable-next-line
        loadBravura().then((data: { metrics: Record<string, any>; fontData: FontData }) => {
          this.metrics = data.metrics;
          this.fontData = data.fontData;
        });
        break;
      case 'Custom':
        // eslint-disable-next-line
        loadCustom().then((data: { metrics: Record<string, any>; fontData: FontData }) => {
          this.metrics = data.metrics;
          this.fontData = data.fontData;
        });
        break;
      case 'Gonville':
        // eslint-disable-next-line
        loadGonville().then((data: { metrics: Record<string, any>; fontData: FontData }) => {
          this.metrics = data.metrics;
          this.fontData = data.fontData;
        });
        break;
      case 'Petaluma':
        // eslint-disable-next-line
        loadPetaluma().then((data: { metrics: Record<string, any>; fontData: FontData }) => {
          this.metrics = data.metrics;
          this.fontData = data.fontData;
        });
        break;
      default:
        this.metrics = metrics;
        this.fontData = fontData;
    }
  }

  getName(): string {
    return this.name;
  }

  getResolution(): number {
    if (!this.metrics || !this.fontData) throw new RuntimeError('Missing metrics or font data');
    return this.fontData.resolution;
  }

  // eslint-disable-next-line
  getMetrics(): Record<string, any> {
    if (!this.metrics || !this.fontData) throw new RuntimeError('Missing metrics or font data');
    return this.metrics;
  }

  // eslint-disable-next-line
  lookupMetric(key: string, defaultValue?: Record<string, any> | number): any {
    if (!this.metrics || !this.fontData) throw new RuntimeError('Missing metrics or font data');
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
    if (!this.metrics || !this.fontData) throw new RuntimeError('Missing metrics or font data');
    return this.fontData;
  }

  getGlyphs(): Record<string, FontGlyph> {
    if (!this.metrics || !this.fontData) throw new RuntimeError('Missing metrics or font data');
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
