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

/** Specified in the `xxx_metrics.ts` files. */
export interface FontMetrics extends Record<string, any> {
  name: string;
  smufl: boolean;
  stave?: Record<string, number>;
  accidental?: Record<string, number>;
  clef?: Record<string, any>;
  pedalMarking?: Record<string, Record<string, number>>;
  digits?: Record<string, number>;
  // Not specified in gonville_metrics.ts.
  articulation?: Record<string, Record<string, number>>;
  tremolo?: Record<string, Record<string, number>>;
  // Not specified in bravura_metrics.ts or gonville_metrics.ts.
  noteHead?: Record<string, Record<string, number>>;
  glyphs: Record<string, Record<string, any>>;
}

export interface FontDataMetrics {
  fontData?: FontData;
  metrics?: FontMetrics;
}

export interface FontGlyph {
  x_min: number;
  x_max: number;
  y_min?: number;
  y_max?: number;
  ha: number;
  leftSideBearing?: number;
  advanceWidth?: number;
  o?: string; // RONYEH-FONT: Made this optional to be compatible with robotoslab_glyphs & petalumascript_glyphs.
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

// Internal <span></span> element for parsing CSS font shorthand strings.
let fontParser: HTMLSpanElement;

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
  static convertToPxScaleFactor: Record<string, number> = {
    pt: 4 / 3,
    px: 1,
    em: 16,
    '%': 4 / 25,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
  };

  /**
   * @param fontSize The font size to convert. Can be specified as a CSS length string (e.g., '16pt', '1em')
   * or as a number (the unit is assumed to be 'pt'). See `Font.convertToPxScaleFactor` for the supported
   * units (e.g., pt, em, %).
   * @returns the number of pixels that is equivalent to `fontSize`
   */
  static convertToPixels(fontSize: string | number = Font.SIZE): number {
    if (typeof fontSize === 'number') {
      // Assume the fontSize is specified in pt.
      return (fontSize * 4) / 3;
    } else {
      const value = parseFloat(fontSize);
      if (isNaN(value)) {
        return 0;
      }
      const unit = fontSize.replace(/[\d.\s]/g, ''); // Remove all numbers, dots, spaces.
      const conversionFactor = Font.convertToPxScaleFactor[unit] ?? 1;
      return value * conversionFactor;
    }
  }

  /**
   * @param fontShorthand a string formatted as CSS font shorthand (e.g., 'italic bold 15pt Arial').
   */
  static parseFont(fontShorthand: string): FontInfo {
    if (!fontParser) {
      fontParser = document.createElement('span');
    }
    fontParser.style.font = fontShorthand;
    const { fontFamily, fontSize, fontWeight, fontStyle } = fontParser.style;
    return { family: fontFamily, size: fontSize, weight: fontWeight, style: fontStyle };
  }

  /**
   * @param fontSize a number representing a font size, or a string font size with units.
   * @param scaleFactor multiply the size by this factor.
   * @returns size * scaleFactor (e.g., 16pt * 3 = 48pt, 8px * 0.5 = 4px, 24 * 2 = 48)
   */
  static scaleSize<T extends number | string>(fontSize: T, scaleFactor: number): T {
    if (typeof fontSize === 'number') {
      return (fontSize * scaleFactor) as T;
    } else {
      const value = parseFloat(fontSize);
      const unit = fontSize.replace(/[\d.\s]/g, ''); // Remove all numbers, dots, spaces.
      return `${value * scaleFactor}${unit}` as T;
    }
  }

  static convertSizeToNumber(fontSize: number | string): number {
    if (typeof fontSize === 'number') {
      return fontSize;
    } else {
      return parseFloat(fontSize);
    }
  }

  /**
   * @param weight a string (e.g., 'bold') or a number (e.g., 600 / semi-bold in the OpenType spec).
   * @returns true if the font weight indicates bold.
   */
  static isBold(weight?: string | number): boolean {
    if (!weight) {
      return false;
    } else if (typeof weight === 'number') {
      return weight >= 600;
    } else {
      // a string can be 'bold' or '700'
      const parsedWeight = parseInt(weight, 10);
      if (isNaN(parsedWeight)) {
        return weight.toLowerCase() === 'bold';
      } else {
        return parsedWeight >= 600;
      }
    }
  }

  /**
   * @param style
   * @returns true if the font style indicates 'italic'.
   */
  static isItalic(style?: string): boolean {
    if (!style) {
      return false;
    } else {
      return style.toLowerCase() === FontStyle.ITALIC;
    }
  }

  static loadDefaultWebFonts(): void {
    //
    console.log('loadDefaultWebFonts!!!');
  }

  static loadWebFont(): void {
    //
    // XXXX
    console.log('loadWebFont YAY!!!');
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Instance Members

  protected name: string;
  protected fontDataMetrics: FontDataMetrics;

  // eslint-disable-next-line
  constructor(name: string, metrics?: FontMetrics, fontData?: FontData) {
    this.name = name;
    this.fontDataMetrics = {};
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
  Bravura: () => new Font('Bravura'),
  Gonville: () => new Font('Gonville'),
  Petaluma: () => new Font('Petaluma'),
  Custom: () => new Font('Custom'),
};

export { Font, Fonts };
