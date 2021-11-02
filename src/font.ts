import { loadBravura } from '@bravura';
import { loadCustom } from '@custom';
import { loadGonville } from '@gonville';
import { loadPetaluma } from '@petaluma';

import { defined } from './util';

export interface FontInfo {
  /** CSS font-family, e.g., 'Arial', 'Helvetica Neue, Arial, sans-serif', 'Times, serif' */
  family?: string;

  /**
   * CSS font-size (e.g., '10pt', '12px').
   * For backwards compatibility with 3.0.9, plain numbers are assumed to be specified in 'pt'.
   */
  size?: number | string;

  /** `bold` or a number (e.g., 900) as inspired by CSS font-weight. */
  weight?: string | number;

  /** `italic` as inspired by CSS font-style. */
  style?: string;
}

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
  cached_outline?: number[];
}

export enum FontWeight {
  NORMAL = 'normal',
  BOLD = 'bold',
}

export enum FontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic',
}

class Font {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Static Members

  /** Default sans-serif font family. */
  static SANS_SERIF: string = 'Arial, sans-serif';

  /** Default serif font family. */
  static SERIF: string = 'Times New Roman, serif';

  /** Default font size in `pt`. */
  static SIZE: number = 10;

  // CSS Font Sizes: 36pt == 48px == 3em == 300% == 0.5in
  /** Given a length (for units: pt, px, em, %, in, mm, cm) what is the scale factor to convert it to px? */
  static convertToPxFrom: Record<string, number> = {
    pt: 4 / 3,
    px: 1,
    em: 16,
    '%': 4 / 25,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Instance Members

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

export { Font, Fonts };
