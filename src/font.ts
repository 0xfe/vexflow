import { ChordSymbolMetrics } from './chordsymbol';
import { ClefMetrics } from './clef';
import { NoteHeadMetrics } from './notehead';
import { OrnamentMetrics } from './ornament';
import { StringNumberMetrics } from './stringnumber';
import { TupletMetrics } from './tuplet';
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

export type FontModule = { data: FontData; metrics: FontMetrics };

export interface FontData {
  glyphs: Record<string, FontGlyph>;
  fontFamily?: string;
  resolution: number;
  generatedOn?: string;
}

/** Specified in the `xxx_metrics.ts` files. */
// eslint-disable-next-line
export interface FontMetrics extends Record<string, any> {
  smufl: boolean;
  stave?: Record<string, number>;
  accidental?: Record<string, number>;
  clef_default?: ClefMetrics;
  clef_small?: ClefMetrics;
  pedalMarking?: Record<string, Record<string, number>>;
  digits?: Record<string, number>;
  articulation?: Record<string, Record<string, number>>;
  tremolo?: Record<string, Record<string, number>>;
  chordSymbol?: ChordSymbolMetrics;
  ornament?: Record<string, OrnamentMetrics>;
  noteHead?: NoteHeadMetrics;
  stringNumber?: StringNumberMetrics;
  tuplet?: TupletMetrics;
  glyphs: Record<
    string,
    {
      point?: number;
      shiftX?: number;
      shiftY?: number;
      scale?: number;
      [key: string]: { point?: number; shiftX?: number; shiftY?: number; scale?: number } | number | undefined;
    }
  >;
}

export interface FontGlyph {
  x_min: number;
  x_max: number;
  y_min?: number;
  y_max?: number;
  ha: number;
  leftSideBearing?: number;
  advanceWidth?: number;

  // The o (outline) field is optional, because robotoslab_glyphs.ts & petalumascript_glyphs.ts
  // do not include glyph outlines. We rely on *.woff files to provide the glyph outlines.
  o?: string;
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
  // STATIC MEMBERS

  /** Default sans-serif font family. */
  static SANS_SERIF: string = 'Arial, sans-serif';

  /** Default serif font family. */
  static SERIF: string = 'Times New Roman, serif';

  /** Default font size in `pt`. */
  static SIZE: number = 10;

  // CSS Font Sizes: 36pt == 48px == 3em == 300% == 0.5in
  /** Given a length (for units: pt, px, em, %, in, mm, cm) what is the scale factor to convert it to px? */
  static scaleToPxFrom: Record<string, number> = {
    pt: 4 / 3,
    px: 1,
    em: 16,
    '%': 4 / 25,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
  };

  /**
   * @param fontSize a font size to convert. Can be specified as a CSS length string (e.g., '16pt', '1em')
   * or as a number (the unit is assumed to be 'pt'). See `Font.scaleToPxFrom` for the supported
   * units (e.g., pt, em, %).
   * @returns the number of pixels that is equivalent to `fontSize`
   */
  static convertSizeToPixelValue(fontSize: string | number = Font.SIZE): number {
    if (typeof fontSize === 'number') {
      // Assume the numeric fontSize is specified in pt.
      return fontSize * Font.scaleToPxFrom.pt;
    } else {
      const value = parseFloat(fontSize);
      if (isNaN(value)) {
        return 0;
      }
      const unit = fontSize.replace(/[\d.\s]/g, '').toLowerCase(); // Extract the unit by removing all numbers, dots, spaces.
      const conversionFactor = Font.scaleToPxFrom[unit] ?? 1;
      return value * conversionFactor;
    }
  }

  /**
   * @param fontSize a font size to convert. Can be specified as a CSS length string (e.g., '16pt', '1em')
   * or as a number (the unit is assumed to be 'pt'). See `Font.scaleToPxFrom` for the supported
   * units (e.g., pt, em, %).
   * @returns the number of points that is equivalent to `fontSize`
   */
  static convertSizeToPointValue(fontSize: string | number = Font.SIZE): number {
    if (typeof fontSize === 'number') {
      // Assume the numeric fontSize is specified in pt.
      return fontSize;
    } else {
      const value = parseFloat(fontSize);
      if (isNaN(value)) {
        return 0;
      }
      const unit = fontSize.replace(/[\d.\s]/g, '').toLowerCase(); // Extract the unit by removing all numbers, dots, spaces.
      const conversionFactor = (Font.scaleToPxFrom[unit] ?? 1) / Font.scaleToPxFrom.pt;
      return value * conversionFactor;
    }
  }

  /**
   * @param f
   * @param size
   * @param weight
   * @param style
   * @returns the `size` field will include the units (e.g., '12pt', '16px').
   */
  static validate(
    f?: string | FontInfo,
    size?: string | number,
    weight?: string | number,
    style?: string
  ): Required<FontInfo> {
    // If f is a string but all other arguments are undefined, we assume that
    // f is CSS font shorthand (e.g., 'italic bold 10pt Arial').
    if (typeof f === 'string' && size === undefined && weight === undefined && style === undefined) {
      return Font.fromCSSString(f);
    }

    let family: string | undefined;
    if (typeof f === 'object') {
      // f is a FontInfo object, so we extract its fields.
      family = f.family;
      size = f.size;
      weight = f.weight;
      style = f.style;
    } else {
      // f is a string representing the font family name or undefined.
      family = f;
    }

    family = family ?? Font.SANS_SERIF;
    size = size ?? Font.SIZE + 'pt';
    weight = weight ?? FontWeight.NORMAL;
    style = style ?? FontStyle.NORMAL;

    if (weight === '') {
      weight = FontWeight.NORMAL;
    }
    if (style === '') {
      style = FontStyle.NORMAL;
    }

    // If size is a number, we assume the unit is `pt`.
    if (typeof size === 'number') {
      size = `${size}pt`;
    }

    // If weight is a number (e.g., 900), turn it into a string representation of that number.
    if (typeof weight === 'number') {
      weight = weight.toString();
    }

    // At this point, `family`, `size`, `weight`, and `style` are all strings.
    return { family, size, weight, style };
  }

  /**
   * @param cssFontShorthand a string formatted as CSS font shorthand (e.g., 'italic bold 15pt Arial').
   */
  static fromCSSString(cssFontShorthand: string): Required<FontInfo> {
    // Let the browser parse this string for us.
    // First, create a span element.
    // Then, set its style.font and extract it back out.
    if (!fontParser) {
      fontParser = document.createElement('span');
    }
    fontParser.style.font = cssFontShorthand;
    const { fontFamily, fontSize, fontWeight, fontStyle } = fontParser.style;
    return { family: fontFamily, size: fontSize, weight: fontWeight, style: fontStyle };
  }

  /**
   * @returns a CSS font shorthand string of the form `italic bold 16pt Arial`.
   */
  static toCSSString(fontInfo?: FontInfo): string {
    if (!fontInfo) {
      return '';
    }

    let style: string;
    const st = fontInfo.style;
    if (st === FontStyle.NORMAL || st === '' || st === undefined) {
      style = ''; // no space! Omit the style section.
    } else {
      style = st.trim() + ' ';
    }

    let weight: string;
    const wt = fontInfo.weight;
    if (wt === FontWeight.NORMAL || wt === '' || wt === undefined) {
      weight = ''; // no space! Omit the weight section.
    } else if (typeof wt === 'number') {
      weight = wt + ' ';
    } else {
      weight = wt.trim() + ' ';
    }

    let size: string;
    const sz = fontInfo.size;
    if (sz === undefined) {
      size = Font.SIZE + 'pt ';
    } else if (typeof sz === 'number') {
      size = sz + 'pt ';
    } else {
      // size is already a string.
      size = sz.trim() + ' ';
    }

    const family: string = fontInfo.family ?? Font.SANS_SERIF;

    return `${style}${weight}${size}${family}`;
  }

  /**
   * @param fontSize a number representing a font size, or a string font size with units.
   * @param scaleFactor multiply the size by this factor.
   * @returns size * scaleFactor (e.g., 16pt * 3 = 48pt, 8px * 0.5 = 4px, 24 * 2 = 48).
   * If the fontSize argument was a number, the return value will be a number.
   * If the fontSize argument was a string, the return value will be a string.
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
   * Customize this field to specify a different CDN for delivering web fonts.
   * Alternative: https://cdn.jsdelivr.net/npm/vexflow-fonts@1.0.3/
   * Or you can use your own host.
   */
  static WEB_FONT_HOST = 'https://unpkg.com/vexflow-fonts@1.0.3/';

  /**
   * These font files will be loaded from the CDN specified by `Font.WEB_FONT_HOST` when
   * `await Font.loadWebFonts()` is called. Customize this field to specify a different
   * set of fonts to load. See: `Font.loadWebFonts()`.
   */
  static WEB_FONT_FILES: Record<string /* fontName */, string /* fontPath */> = {
    'Roboto Slab': 'robotoslab/RobotoSlab-Medium_2.001.woff',
    PetalumaScript: 'petaluma/PetalumaScript_1.10_FS.woff',
  };

  /**
   * @param fontName
   * @param woffURL The absolute or relative URL to the woff file.
   * @param includeWoff2 If true, we assume that a woff2 file is in
   * the same folder as the woff file, and will append a `2` to the url.
   */
  // Support distributions of the typescript compiler that do not yet include the FontFace API declarations.
  // eslint-disable-next-line
  // @ts-ignore
  static async loadWebFont(fontName: string, woffURL: string, includeWoff2: boolean = true): Promise<FontFace> {
    const woff2URL = includeWoff2 ? `url(${woffURL}2) format('woff2'), ` : '';
    const woff1URL = `url(${woffURL}) format('woff')`;
    const woffURLs = woff2URL + woff1URL;
    // eslint-disable-next-line
    // @ts-ignore
    const fontFace = new FontFace(fontName, woffURLs);
    await fontFace.load();
    // eslint-disable-next-line
    // @ts-ignore
    document.fonts.add(fontFace);
    return fontFace;
  }

  /**
   * Load the web fonts that are used by ChordSymbol. For example, `flow.html` calls:
   *   `await Vex.Flow.Font.loadWebFonts();`
   * Alternatively, you may load web fonts with a stylesheet link (e.g., from Google Fonts),
   * and a @font-face { font-family: ... } rule in your CSS.
   * If you do not load either of these fonts, ChordSymbol will fall back to Times or Arial,
   * depending on the current music engraving font.
   *
   * You can customize `Font.WEB_FONT_HOST` and `Font.WEB_FONT_FILES` to load different fonts
   * for your app.
   */
  static async loadWebFonts(): Promise<void> {
    const host = Font.WEB_FONT_HOST;
    const files = Font.WEB_FONT_FILES;
    for (const fontName in files) {
      const fontPath = files[fontName];
      Font.loadWebFont(fontName, host + fontPath);
    }
  }

  /**
   * @param fontName
   * @param data optionally set the Font object's `.data` property.
   *   This is usually done when setting up a font for the first time.
   * @param metrics optionally set the Font object's `.metrics` property.
   *   This is usually done when setting up a font for the first time.
   * @returns a Font object with the given `fontName`.
   *   Reuse an existing Font object if a matching one is found.
   */
  static load(fontName: string, data?: FontData, metrics?: FontMetrics): Font {
    let font = Fonts[fontName];
    if (!font) {
      font = new Font(fontName);
      Fonts[fontName] = font;
    }
    if (data) {
      font.setData(data);
    }
    if (metrics) {
      font.setMetrics(metrics);
    }
    return font;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // INSTANCE MEMBERS

  protected name: string;
  protected data?: FontData;
  protected metrics?: FontMetrics;

  /**
   * Use `Font.load(fontName)` to get a Font object.
   * Do not call this constructor directly.
   */
  private constructor(fontName: string) {
    this.name = fontName;
  }

  getName(): string {
    return this.name;
  }

  getData(): FontData {
    return defined(this.data, 'FontError', 'Missing font data');
  }

  getMetrics(): FontMetrics {
    return defined(this.metrics, 'FontError', 'Missing metrics');
  }

  setData(data: FontData): void {
    this.data = data;
  }

  setMetrics(metrics: FontMetrics): void {
    this.metrics = metrics;
  }

  hasData(): boolean {
    return this.data !== undefined;
  }

  getResolution(): number {
    return this.getData().resolution;
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
    return currObj;
  }

  /** For debugging. */
  toString(): string {
    return '[' + this.name + ' Font]';
  }
}
