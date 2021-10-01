import { defined } from './util';
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
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  height: number;
  ha: number;
  // o: string; // OLD Modified SVG Path
  d: string; // SVG Path
  leftSideBearing?: number;
  advanceWidth?: number;
  cached_outline?: number[];
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
    return this.getFontData().resolution;
  }

  // eslint-disable-next-line
  getMetrics(): Record<string, any> {
    return defined(this.fontDataMetrics.metrics, 'FontError', 'Missing metrics');
  }

  /**
   * Use the provided key to look up a value in this font's metrics file (e.g., bravura_metrics.ts, petaluma_metrics.ts).
   * @param key is a string separated by periods (e.g., stave.endPaddingMax, clef.lineCount.'5'.shiftY).
   * @param defaultValue is returned if the lookup fails.
   * @returns the retrieved value (or `defaultValue` if the lookup fails).
   */
  // eslint-disable-next-line
  lookupMetric(key: string, defaultValue?: Record<string, any> | number): any {
    // console.log('lookupMetric:', key);

    const keyParts = key.split('.');

    // Start with the top level font metrics object, and keep looking deeper into the object (via each part of the period-delimited key).
    let currObj = this.getMetrics();
    for (let i = 0; i < keyParts.length; i++) {
      const keyPart = keyParts[i];
      const value = currObj[keyPart];
      if (value === undefined) {
        // If the key lookup fails, we fall back to the defaultValue.
        return defaultValue;
      }
      // The most recent lookup succeeded, so we drill deeper into the object.
      currObj = value;
    }

    // After checking every part of the key (i.e., the loop completed), return the most recently retrieved value.
    // console.log('found:', key, currObj);
    return currObj;
  }

  getFontData(): FontData {
    return defined(this.fontDataMetrics.fontData, 'FontError', 'Missing font data');
  }

  getGlyphs(): Record<string, FontGlyph> {
    return this.getFontData().glyphs;
  }
}

const Fonts = {
  Bravura: (): Font => new Font('Bravura'),
  Gonville: (): Font => new Font('Gonville'),
  Petaluma: (): Font => new Font('Petaluma'),
  Custom: (): Font => new Font('Custom'),
};

export { Fonts, Font };
