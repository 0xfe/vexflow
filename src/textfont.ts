// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This file handles a registry of text font metric information, so all
// VexFlow modules can take advantage of font metrics in a uniform way.
//

import { Font } from './font';
import { PetalumaScriptTextMetrics } from './fonts/petalumascript_textmetrics';
import { RobotoSlabTextMetrics } from './fonts/robotoslab_textmetrics';
import { log, RuntimeError } from './util';

export interface TextFontInfo extends Record<string, unknown> {
  name?: string;
  resolution?: number;
  glyphs?: Record<string, FontGlyph>;
  family: string;
  serifs: boolean;
  monospaced?: boolean;
  italic: boolean;
  bold: boolean;
  maxSizeGlyph?: string;
  superscriptOffset?: number;
  subscriptOffset?: number;
  description: string;
}

// eslint-disable-next-line
function L(...args: any[]) {
  if (TextFont.DEBUG) log('Vex.Flow.TextFont', args);
}

/**
 * Text widths are stored in a cache, so we don't have to recompute widths
 * for the same font + string combination.
 *
 * The cache is first keyed by the font information. The key is of the form:
 *   `${family}-${size}-${weight}-${style}`
 * The second level key is the specific text to be measured.
 *
 * The stored value is the measured width in pixels.
 *   textWidth == textWidthCache[widthCacheKey][textToMeasure]
 */
const textWidthCache: Record<string, Record<string, number>> = {};

/**
 * Applications may register additional fonts via TextFont.registerFont().
 * The metrics for those fonts will be made available to the application.
 */
const fontRegistry: Record<string, TextFontInfo> = {
  'Roboto Slab': {
    name: 'Roboto Slab',
    family: RobotoSlabTextMetrics.fontFamily,
    resolution: RobotoSlabTextMetrics.resolution,
    glyphs: RobotoSlabTextMetrics.glyphs,
    serifs: true,
    monospaced: false,
    italic: false,
    bold: false,
    maxSizeGlyph: 'H',
    superscriptOffset: 0.66,
    subscriptOffset: 0.66,
    description: 'Default text font to pair with the Bravura / Gonville engraving fonts.',
  },
  PetalumaScript: {
    name: 'PetalumaScript',
    family: PetalumaScriptTextMetrics.fontFamily,
    resolution: PetalumaScriptTextMetrics.resolution,
    glyphs: PetalumaScriptTextMetrics.glyphs,
    serifs: false,
    monospaced: false,
    italic: false,
    bold: false,
    maxSizeGlyph: 'H',
    superscriptOffset: 0.66,
    subscriptOffset: 0.66,
    description: 'Default text font to pair with the Petaluma engraving font.',
  },
};

export class TextFont {
  /** To enable logging for this class. Set `Vex.Flow.TextFont.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return 'TextFont';
  }

  /**
   * Web fonts are generally distributed per weight / style (bold, italic).
   * Return all available families with the attributes that are available for each font.
   * We assume descriptions are the same for different weights / styles.
   */
  static getFontFamilies(): TextFontInfo[] {
    const retrievedFonts: Record<string, TextFontInfo> = {};

    for (const fontName in fontRegistry) {
      const fontInfo = fontRegistry[fontName];

      // It is possible for font files to have a different `fontName` (e.g., MyFont-Medium, MyFont-Black),
      // while sharing the same `family` field. TODO: Verify this comment!
      const family = fontInfo.family;
      if (!retrievedFonts[family]) {
        retrievedFonts[family] = {
          family: family,
          description: fontInfo.description,
          bold: fontInfo.bold,
          italic: fontInfo.italic,
          monospaced: fontInfo.monospaced,
          serifs: fontInfo.serifs,
          // TODO: Do we need to extract more fields???
        };
      } else {
        // If the family matches one that we have already processed, we just
        // set the boolean flags for bold / italic / monospaced / serifs.
        ['bold', 'italic', 'monospaced', 'serifs'].forEach((attr) => {
          if (fontInfo[attr]) {
            retrievedFonts[family][attr] = true;
          }
        });
      }
    }
    return Object.values(retrievedFonts);
  }

  /**
   * Find the font from the registry that most closely matches the requested font.
   * We compare font family, bold, and italic attributes.
   * This method will always return a fallback font if there are no matches.
   */
  static createFormatter(requestedFont: FontInfo = {}): TextFont {
    if (!requestedFont.family) {
      requestedFont.family = Font.SANS_SERIF;
    }

    const candidates: TextFontInfo[] = [];
    // The incoming font family is a string of comma-separated font family names
    // (e.g., `PetalumaScript, Arial, sans-serif`).
    const requestedFamilies = requestedFont.family.split(/\s*,\s*/);
    for (const requestedFamily of requestedFamilies) {
      for (const fontName in fontRegistry) {
        const font = fontRegistry[fontName];
        if (font.family === requestedFamily) {
          candidates.push(font);
        }
      }
      if (candidates.length > 0) {
        break;
      }
    }

    let selectedFont;
    if (candidates.length === 0) {
      // No match, so return a fallback font.
      selectedFont = new TextFont(Object.values(fontRegistry)[0]);
    } else if (candidates.length === 1) {
      selectedFont = new TextFont(candidates[0]);
    } else {
      const bold = Font.isBold(requestedFont.weight);
      const italic = Font.isItalic(requestedFont.style);
      const perfectMatch = candidates.find((f) => f.bold === bold && f.italic === italic);
      if (perfectMatch) {
        selectedFont = new TextFont(perfectMatch);
      } else {
        const partialMatch = candidates.find((f) => f.italic === italic || f.bold === bold);
        if (partialMatch) {
          selectedFont = new TextFont(partialMatch);
        } else {
          selectedFont = new TextFont(candidates[0]);
        }
      }
    }

    // TODO: Handle when font size is a string like '16px'???
    if (typeof requestedFont.size === 'number' && requestedFont.size > 0) {
      selectedFont.setFontSize(requestedFont.size);
    }
    return selectedFont;
  }

  static getFontInfoByName(fontName: string): TextFontInfo | undefined {
    return fontRegistry[fontName];
  }

  /**
   * Applications may register their own fonts and the metrics, and those metrics
   * will be available to the application for formatting.
   *
   * See fontRegistry for format of font metrics.  Metrics can be generated from any
   * font file using textmetrics_fontgen.js in the tools/smufl directory.
   * @param fontInfo
   * @param overwrite
   */
  static registerFont(fontInfo: TextFontInfo, overwrite: boolean = false): void {
    const fontName = fontInfo.name ?? '';
    const currFontInfo = fontRegistry[fontName];
    if (typeof currFontInfo === 'undefined' || overwrite) {
      fontRegistry[fontName] = fontInfo;
    }
  }

  /** Font family. */
  protected family: string = '';

  /** Specified in pt units. */
  protected size: number = 14;

  /**  */
  protected weight: string = 'normal';

  /**  */
  protected style: string = 'normal';

  /** Font metrics are extracted at 1000 upem (units per em). */
  protected resolution: number = 1000;

  protected name?: string;
  protected description?: string;
  protected glyphs: Record<string, FontGlyph> = {};
  protected serifs: boolean = false;
  protected monospaced: boolean = false;
  protected italic: boolean = false;
  protected bold: boolean = false;
  protected superscriptOffset: number = 0;
  protected subscriptOffset: number = 0;
  protected maxSizeGlyph: string = 'H';

  protected widthCacheKey: string = '';

  // protected attrs: { type: string }; // RONYEH-FONT UNUSED

  /** The preferred method for returning an instance of this class is via `TextFont.createFormatter()` */
  constructor(params: TextFontInfo) {
    if (!params.name) {
      throw new RuntimeError('BadArgument', 'Font must specify a name.');
    }

    if (params.glyphs && params.resolution) {
      TextFont.registerFont(params /*, overwrite = false */);
    }

    const fontInfo = params.glyphs ? params : TextFont.getFontInfoByName(params.name);
    if (fontInfo) {
      this.updateParams(fontInfo);
    }

    this.updateWidthCacheKey();
  }

  updateParams(params: TextFontInfo): void {
    if (params.name) this.name = params.name;
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
  }

  /** Create a hash with the current font data, so we can cache computed widths. */
  updateWidthCacheKey(): void {
    this.widthCacheKey = `${this.family}-${this.size}-${this.weight}-${this.style}`;
  }

  getMetricForCharacter(c: string): FontGlyph {
    if (this.glyphs[c]) {
      return this.glyphs[c];
    } else {
      return this.glyphs[this.maxSizeGlyph];
    }
  }

  get maxHeight(): number {
    const glyph = this.getMetricForCharacter(this.maxSizeGlyph);
    return (glyph.ha / this.resolution) * this.fontSizeInPx;
  }

  getWidthForCharacterInPx(c: string): number {
    const metric = this.getMetricForCharacter(c);
    if (!metric) {
      return 0.65 * this.fontSizeInPx;
    }
    const advanceWidth = metric.advanceWidth ?? 0;
    return (advanceWidth / this.resolution) * this.fontSizeInPx;
  }

  /**
   * The character's advanceWidth as a fraction of an `em` unit.
   * A 250 advanceWidth in a 1000 unitsPerEm font returns 0.25.
   */
  getWidthForCharacterInEm(c: string): number {
    const advanceWidth = this.getMetricForCharacter(c).advanceWidth ?? 0;
    return advanceWidth / this.resolution;
  }

  getWidthForText(s: string): number {
    const key = this.widthCacheKey;
    if (!textWidthCache[key]) {
      textWidthCache[key] = {};
    }
    if (!textWidthCache[key][s]) {
      let width = 0;
      for (let i = 0; i < s.length; ++i) {
        width += this.getWidthForCharacterInPx(s[i]);
      }
      textWidthCache[key][s] = width;
    }
    return textWidthCache[key][s];
  }

  // The font size is specified in points. Convert to pixels.
  get fontSizeInPx(): number {
    return (this.size * 4) / 3;
  }

  setFontSize(size: number): this {
    this.size = size;
    // The width cache key depends on the current font size.
    this.updateWidthCacheKey();
    return this;
  }

  getResolution(): number {
    return this.resolution;
  }
}
