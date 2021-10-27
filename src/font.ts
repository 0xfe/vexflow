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
  // Static Members

  static get CATEGORY(): string {
    return 'Font';
  }

  /**
   * Customize this field to specify a different CDN for delivering web fonts.
   * https://cdn.jsdelivr.net/npm/vexflow-fonts@1.0.3/
   */
  static FONT_HOST = 'https://unpkg.com/vexflow-fonts@1.0.3/';

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

  /**
   * @param fontSize The font size to convert. Can be specified as a CSS length string (e.g., '16pt', '1em')
   * or as a number (the unit is assumed to be 'pt'). See `Font.convertToPxFrom` for the supported
   * units (e.g., pt, em, %).
   * @returns the number of pixels that is equivalent to `fontSize`
   */
  static toPixels(fontSize: string | number = Font.SIZE): number {
    if (typeof fontSize === 'number') {
      // Assume the fontSize is specified in pt.
      return fontSize * Font.convertToPxFrom.pt;
    } else {
      const value = parseFloat(fontSize);
      if (isNaN(value)) {
        return 0;
      }
      const unit = fontSize.replace(/[\d.\s]/g, ''); // Remove all numbers, dots, spaces.
      const conversionFactor = Font.convertToPxFrom[unit] ?? 1;
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

  /**
   * @param fontSize can be a number or a string representing a font size (e.g., '16pt', '1.5em').
   * @returns just the numeric part of the size (e.g., '16pt' -> 16, '1.5em' -> 1.5).
   */
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

  static async loadWebFontRobotoSlab(): Promise<void> {
    Font.loadWebFont('Roboto Slab', Font.FONT_HOST + 'robotoslab/RobotoSlab-Medium_2.001.woff');
  }

  static async loadWebFontPetalumaScript(): Promise<void> {
    Font.loadWebFont('PetalumaScript', Font.FONT_HOST + 'petaluma/PetalumaScript_1.10_FS.woff');
  }

  /**
   * Load the two web fonts that are used by ChordSymbol. For example, `flow.html` calls:
   *   `await Vex.Flow.Font.loadWebFonts();`
   * Alternatively, you may load web fonts with a stylesheet link (e.g., from Google Fonts),
   * and a @font-face { font-family: ... } rule in your CSS.
   * If you do not load either of these fonts, ChordSymbol will fall back to either Times or Arial.
   */
  static async loadWebFonts(): Promise<void> {
    Font.loadWebFontRobotoSlab();
    Font.loadWebFontPetalumaScript();
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
  // Instance Members

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

  setDataAndMetrics(obj: { data: FontData; metrics: FontMetrics }): void {
    this.data = obj.data;
    this.metrics = obj.metrics;
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
    // console.log('lookupMetric: ', key);

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
    // console.log('found: ', key, currObj);
    return currObj;
  }

  /** For debugging. */
  toString(): string {
    return '[' + this.name + ' Font]';
  }
}
