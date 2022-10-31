// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font, FontGlyph, FontInfo, FontStyle, FontWeight } from './font';
import { log } from './util';

export interface TextFormatterInfo extends Record<string, unknown> {
  family: string;
  resolution?: number;
  glyphs?: Record<string, FontGlyph>;
  serifs: boolean;
  monospaced: boolean;
  italic: boolean;
  bold: boolean;
  maxSizeGlyph?: string;
  superscriptOffset?: number;
  subscriptOffset?: number;
  description: string;
}

/**
 * Y information, 0 is baseline, yMin is lowest point.
 */
export interface yExtent {
  yMin: number;
  yMax: number;
  height: number;
}
// eslint-disable-next-line
function L(...args: any[]) {
  if (TextFormatter.DEBUG) log('Vex.Flow.TextFormatter', args);
}

/**
 * Text widths are stored in a cache, so we don't have to recompute widths
 * for the same font + string combination.
 *
 * The cache is first keyed by the font information. The key is of the form:
 *   `${family}-${size}-${weight}-${style}`
 * The second level key is the specific text to be measured.
 *
 * The stored value is the measured width in `em` units.
 *   textWidth == textWidthCache[cacheKey][textToMeasure]
 */
const textWidthCache: Record<string, Record<string, number | undefined> | undefined> = {};
const textHeightCache: Record<string, Record<string, yExtent | undefined> | undefined> = {};
/**
 * Applications may register additional fonts via `TextFormatter.registerInfo(info)`.
 * The metrics for those fonts will be made available to the application.
 */
const registry: Record<string, TextFormatterInfo> = {};

export class TextFormatter {
  /** To enable logging for this class. Set `Vex.Flow.TextFormatter.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  /**
   * Return all registered font families.
   */
  static getFontFamilies(): TextFormatterInfo[] {
    const registeredFonts: TextFormatterInfo[] = [];
    for (const fontFamily in registry) {
      const formatterInfo = registry[fontFamily];
      registeredFonts.push({ ...formatterInfo });
    }
    return registeredFonts;
  }

  /**
   * Call `TextFormatter.registerInfo(info)` to register font information before using this method.
   *
   * This method creates a formatter for the font that most closely matches the requested font.
   * We compare font family, bold, and italic attributes.
   * This method will return a fallback formatter if there are no matches.
   */
  static create(requestedFont: FontInfo = {}): TextFormatter {
    L('create: ', requestedFont);
    if (!requestedFont.family) {
      requestedFont.family = Font.SANS_SERIF;
    }

    // TODO: One potential (small) optimization is to cache the TextFormatter object
    // returned for each font info. We would probably want to clear the cache if
    // the registry is ever updated.

    const candidates: TextFormatterInfo[] = [];
    // The incoming font family is a string of comma-separated font family names.
    // (e.g., `PetalumaScript, Arial, sans-serif`).
    const requestedFamilies = requestedFont.family.split(/\s*,\s*/);
    for (const requestedFamily of requestedFamilies) {
      for (const fontFamily in registry) {
        // Support cases where the registry contains 'Roboto Slab Medium',
        // but the requestedFont.family is 'Roboto Slab'.
        if (fontFamily.startsWith(requestedFamily)) {
          candidates.push(registry[fontFamily]);
        }
      }
      if (candidates.length > 0) {
        break;
      }
    }

    let formatter;
    if (candidates.length === 0) {
      // No match, so return a fallback text formatter.
      formatter = new TextFormatter(Object.values(registry)[0]);
    } else if (candidates.length === 1) {
      formatter = new TextFormatter(candidates[0]);
    } else {
      const bold = Font.isBold(requestedFont.weight);
      const italic = Font.isItalic(requestedFont.style);
      const perfectMatch = candidates.find((f) => f.bold === bold && f.italic === italic);
      if (perfectMatch) {
        formatter = new TextFormatter(perfectMatch);
      } else {
        const partialMatch = candidates.find((f) => f.italic === italic || f.bold === bold);
        if (partialMatch) {
          formatter = new TextFormatter(partialMatch);
        } else {
          formatter = new TextFormatter(candidates[0]);
        }
      }
    }

    const fontSize = requestedFont.size;
    if (typeof fontSize !== 'undefined') {
      const fontSizeInPt = Font.convertSizeToPointValue(fontSize);
      formatter.setFontSize(fontSizeInPt);
    }
    return formatter;
  }

  /**
   * @param fontFamily used as a key to the font registry.
   * @returns the same info object that was passed in via `TextFormatter.registerInfo(info)`
   */
  static getInfo(fontFamily: string): TextFormatterInfo | undefined {
    return registry[fontFamily];
  }

  /**
   * Apps may register their own fonts and metrics, and those metrics
   * will be available to the app for formatting.
   *
   * Metrics can be generated from a font file using fontgen_text.js in the tools/fonts directory.
   * @param info
   * @param overwrite
   */
  static registerInfo(info: TextFormatterInfo, overwrite: boolean = false): void {
    L('registerInfo: ', info, overwrite);
    const fontFamily = info.family;
    const currFontInfo = registry[fontFamily];
    if (currFontInfo === undefined || overwrite) {
      registry[fontFamily] = info;
    }
  }

  /** Font family. */
  protected family: string = '';

  /** Specified in `pt` units. */
  protected size: number = 14;

  /** Font metrics are extracted at 1000 upem (units per em). */
  protected resolution: number = 1000;

  /**
   * For text formatting, we do not require glyph outlines, but instead rely on glyph
   * bounding box metrics such as:
   * ```
   * {
   *    x_min: 48,
   *    x_max: 235,
   *    y_min: -17,
   *    y_max: 734,
   *    ha: 751,
   *    leftSideBearing: 48,
   *    advanceWidth: 286,
   *  }
   * ```
   */
  protected glyphs: Record<string, FontGlyph> = {};
  protected description?: string;
  protected serifs: boolean = false;
  protected monospaced: boolean = false;
  protected italic: boolean = false;
  protected bold: boolean = false;
  protected superscriptOffset: number = 0;
  protected subscriptOffset: number = 0;
  protected maxSizeGlyph: string = '@';

  // This is an internal key used to index the `textWidthCache`.
  protected cacheKey: string = '';

  /**
   * Use `TextFormatter.create(...)` to build an instance from information previously
   * registered via `TextFormatter.registerInfo(info)`.
   */
  private constructor(formatterInfo: TextFormatterInfo) {
    this.updateParams(formatterInfo);
  }
  get localHeightCache(): Record<string, yExtent | undefined> {
    if (textHeightCache[this.cacheKey] === undefined) {
      textHeightCache[this.cacheKey] = {};
    }
    return textHeightCache[this.cacheKey] ?? {};
  }
  updateParams(params: TextFormatterInfo): void {
    if (params.family) this.family = params.family;
    if (params.resolution) this.resolution = params.resolution;
    if (params.glyphs) this.glyphs = params.glyphs;
    if (params.serifs) this.serifs = params.serifs;
    if (params.monospaced) this.monospaced = params.monospaced;
    if (params.italic) this.italic = params.italic;
    if (params.bold) this.bold = params.bold;
    if (params.maxSizeGlyph) this.maxSizeGlyph = params.maxSizeGlyph;
    if (params.superscriptOffset) this.superscriptOffset = params.superscriptOffset;
    if (params.subscriptOffset) this.subscriptOffset = params.subscriptOffset;
    this.updateCacheKey();
  }

  /** Create a hash with the current font data, so we can cache computed widths. */
  updateCacheKey(): void {
    const family = this.family.replace(/\s+/g, '_');
    const size = this.size;
    const weight = this.bold ? FontWeight.BOLD : FontWeight.NORMAL;
    const style = this.italic ? FontStyle.ITALIC : FontStyle.NORMAL;
    // Use the same key format as SVGContext.
    this.cacheKey = `${family}%${size}%${weight}%${style}`;
  }

  /**
   * The glyphs table is indexed by the character (e.g., 'C', '@').
   * See: robotoslab_glyphs.ts & petalumascript_glyphs.ts.
   */
  getGlyphMetrics(character: string): FontGlyph {
    if (this.glyphs[character]) {
      return this.glyphs[character];
    } else {
      return this.glyphs[this.maxSizeGlyph];
    }
  }

  get maxHeight(): number {
    const metrics = this.getGlyphMetrics(this.maxSizeGlyph);
    return (metrics.ha / this.resolution) * this.fontSizeInPixels;
  }

  /**
   * Retrieve the character's advanceWidth as a fraction of an `em` unit.
   * For the space character ' ' as defined in the:
   *   petalumascript_glyphs.ts: 250 advanceWidth in the 1000 unitsPerEm font returns 0.25.
   *   robotoslab_glyphs.ts:     509 advanceWidth in the 2048 unitsPerEm font returns 0.2485.
   */
  getWidthForCharacterInEm(c: string): number {
    const metrics = this.getGlyphMetrics(c);
    if (!metrics) {
      // An arbitrary number, close to the `em` width of the '#' and '5' characters in PetalumaScript.
      return 0.65;
    } else {
      const advanceWidth = metrics.advanceWidth ?? 0;
      return advanceWidth / this.resolution;
    }
  }
  /**
   * Retrieve the character's y bounds (ymin, ymax) and height.
   */
  getYForCharacterInPx(c: string): yExtent {
    const metrics = this.getGlyphMetrics(c);
    const rv = { yMin: 0, yMax: this.maxHeight, height: this.maxHeight };
    if (!metrics) {
      return rv;
    } else {
      if (typeof metrics.y_min === 'number') {
        rv.yMin = (metrics.y_min / this.resolution) * this.fontSizeInPixels;
      }
      if (typeof metrics.y_max === 'number') {
        rv.yMax = (metrics.y_max / this.resolution) * this.fontSizeInPixels;
      }
      rv.height = rv.yMax - rv.yMin;
      return rv;
    }
  }
  getYForStringInPx(str: string): yExtent {
    const entry = this.localHeightCache;
    const extent = { yMin: 0, yMax: this.maxHeight, height: this.maxHeight };
    const cache = entry[str];
    if (cache !== undefined) {
      return cache;
    }
    for (let i = 0; i < str.length; ++i) {
      const curY = this.getYForCharacterInPx(str[i]);
      extent.yMin = Math.min(extent.yMin, curY.yMin);
      extent.yMax = Math.max(extent.yMax, curY.yMax);
      extent.height = extent.yMax - extent.yMin;
    }
    entry[str] = extent;
    return extent;
  }
  /**
   * Retrieve the total width of `text` in `em` units.
   */
  getWidthForTextInEm(text: string): number {
    const key = this.cacheKey;
    // Get the cache for this specific font family, size, weight, style combination.
    // The cache contains previously computed widths for different `text` strings.
    let cachedWidths = textWidthCache[key];
    if (cachedWidths === undefined) {
      cachedWidths = {};
      textWidthCache[key] = cachedWidths;
    }

    let width = cachedWidths[text];
    if (width === undefined) {
      width = 0;
      for (let i = 0; i < text.length; ++i) {
        width += this.getWidthForCharacterInEm(text[i]);
      }
      cachedWidths[text] = width;
    }
    return width;
  }
  /** The width of the text (in `em`) is scaled by the font size (in `px`). */
  getWidthForTextInPx(text: string): number {
    return this.getWidthForTextInEm(text) * this.fontSizeInPixels;
  }

  /**
   * @param size in pt.
   */
  setFontSize(size: number): this {
    this.size = size;
    // The width cache key depends on the current font size.
    this.updateCacheKey();
    return this;
  }

  /** `this.size` is specified in points. Convert to pixels. */
  get fontSizeInPixels(): number {
    return this.size * Font.scaleToPxFrom.pt;
  }

  getResolution(): number {
    return this.resolution;
  }
}
