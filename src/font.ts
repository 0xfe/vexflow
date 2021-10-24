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
// eslint-disable-next-line
export interface FontMetrics extends Record<string, any> {
  name: string;
  smufl: boolean;
  stave?: Record<string, number>;
  accidental?: Record<string, number>;
  // eslint-disable-next-line
  clef?: Record<string, any>;
  pedalMarking?: Record<string, Record<string, number>>;
  digits?: Record<string, number>;
  // Not specified in gonville_metrics.ts.
  articulation?: Record<string, Record<string, number>>;
  tremolo?: Record<string, Record<string, number>>;
  // Not specified in bravura_metrics.ts or gonville_metrics.ts.
  noteHead?: Record<string, Record<string, number>>;
  // eslint-disable-next-line
  glyphs: Record<string, Record<string, any>>;
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

const Fonts: Record<string, Font> = {};

export class Font {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Static Members

  static get CATEGORY(): string {
    return 'Font';
  }

  /** Customize this field to specify a different CDN for delivering web fonts. */
  static FONT_HOST = 'https://unpkg.com/vexflow-fonts@1.0.3/';

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

  /**
   * @param fontName
   * @param woffURL The absolute or relative URL to the woff file.
   * @param includeWoff2 If true, we assume that a woff2 file is in
   * the same folder as the woff file, and will append a `2` to the url.
   */
  static async loadWebFont(fontName: string, woffURL: string, includeWoff2: boolean = true): Promise<FontFace> {
    const woff2URL = includeWoff2 ? `url(${woffURL}2) format('woff2'), ` : '';
    const woff1URL = `url(${woffURL}) format('woff')`;
    const woffURLs = woff2URL + woff1URL;
    const fontFace = new FontFace(fontName, woffURLs);
    await fontFace.load();
    document.fonts.add(fontFace);
    return fontFace;
  }

  static async loadRobotoSlab(): Promise<void> {
    Font.loadWebFont('Roboto Slab', Font.FONT_HOST + 'robotoslab/RobotoSlab-Medium_2.001.woff');
  }

  static async loadPetalumaScript(): Promise<void> {
    Font.loadWebFont('PetalumaScript', Font.FONT_HOST + 'petaluma/PetalumaScript_1.10_FS.woff');
  }

  /**
   * See `flow.html` for an example of how to use this method.
   */
  static async loadWebFonts(): Promise<void> {
    Font.loadRobotoSlab();
    Font.loadPetalumaScript();
  }

  static get(fontName: string): Font {
    let font = Fonts[fontName];
    if (!font) {
      font = new Font(fontName);
      Fonts[fontName] = font;
    }
    return font;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Instance Members

  protected name: string;

  data?: FontData;
  metrics?: FontMetrics;

  // Do not call this constructor directly.
  // Use Font.get(fontName) to get a Font object.
  private constructor(fontName: string) {
    this.name = fontName;
  }

  getName(): string {
    return this.name;
  }

  getResolution(): number {
    return this.getData().resolution;
  }

  // eslint-disable-next-line
  getMetrics(): FontMetrics {
    return defined(this.metrics, 'FontError', 'Missing metrics');
  }

  getData(): FontData {
    return defined(this.data, 'FontError', 'Missing font data');
  }

  getGlyphs(): Record<string, FontGlyph> {
    return this.getData().glyphs;
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

  /** For debugging. */
  toString(): string {
    return '[' + this.name + ' Font]';
  }
}
