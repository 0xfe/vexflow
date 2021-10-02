// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This file handles a registry of text font metric information, so all
// VexFlow modules can take advantage of font metrics in a uniform way.
//

import { PetalumaScriptTextMetrics } from './fonts/petalumascript_textmetrics';
import { RobotoSlabTextMetrics } from './fonts/robotoslab_textmetrics';
import { FontInfo } from './types/common';
import { log, RuntimeError } from './util';

export interface TextFontMetrics {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  ha: number;
  leftSideBearing: number;
  advanceWidth: number;
}

export interface TextFontInfo extends Record<string, unknown> {
  name?: string;
  resolution?: number;
  glyphs?: Record<string, TextFontMetrics>;
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
 * Helper for `TextFont.createTextFont()`.
 * @param weight a string (e.g., 'bold') or a number (e.g., 600 / semi-bold in the OpenType spec).
 * @returns true if the font weight indicates bold.
 */
function isBold(weight?: string | number): boolean {
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
 * Helper for `TextFont.createTextFont()`.
 * @param style
 * @returns true if the font style indicates 'italic'.
 */
function isItalic(style?: string): boolean {
  if (!style) {
    return false;
  } else {
    return style.toLowerCase() === 'italic';
  }
}

export class TextFont {
  /** To enable logging for this class. Set `Vex.Flow.TextFont.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return 'TextFont';
  }

  static SANS_SERIF: string = 'Arial, sans-serif';
  static SERIF: string = 'Times New Roman, Times, serif';

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
   * or as a number (the unit is assumed to be 'pt'). See `TextFont.convertToPxScaleFactor` for the supported
   * units (e.g., pt, em, %).
   * @returns the number of pixels that is equivalent to `fontSize`
   */
  static convertToPixels(fontSize: string | number): number {
    if (typeof fontSize === 'number') {
      // Assume the fontSize is specified in pt.
      return (fontSize * 4) / 3;
    } else {
      const value = parseInt(fontSize);
      const unit = fontSize.replace(/[\d\s]/g, ''); // Remove all numbers and spaces.
      const conversionFactor = TextFont.convertToPxScaleFactor[unit] ?? 1;
      return value * conversionFactor;
    }
  }

  protected static registryInstance: TextFontInfo[];
  protected static textWidthCacheInstance?: Record<string, Record<string, number>>;

  // ### fontRegistry
  // Getter of an array of available fonts.  Applications may register their
  // own fonts and the metrics for those fonts will be available to the
  // application.
  static get fontRegistry(): TextFontInfo[] {
    if (!TextFont.registryInstance) {
      TextFont.registryInstance = [];
      TextFont.registryInstance.push({
        name: 'Roboto Slab',
        resolution: RobotoSlabTextMetrics.resolution,
        glyphs: RobotoSlabTextMetrics.glyphs,
        family: RobotoSlabTextMetrics.fontFamily,
        serifs: true,
        monospaced: false,
        italic: false,
        bold: false,
        maxSizeGlyph: 'H',
        superscriptOffset: 0.66,
        subscriptOffset: 0.66,
        description: 'Default text font to pair with Bravura/Gonville engraving font',
      });
      TextFont.registryInstance.push({
        name: 'PetalumaScript',
        resolution: PetalumaScriptTextMetrics.resolution,
        glyphs: PetalumaScriptTextMetrics.glyphs,
        family: PetalumaScriptTextMetrics.fontFamily,
        serifs: false,
        monospaced: false,
        italic: false,
        bold: false,
        maxSizeGlyph: 'H',
        superscriptOffset: 0.66,
        subscriptOffset: 0.66,
        description: 'Default text font to pair with Petaluma engraving font',
      });
    }
    return TextFont.registryInstance;
  }

  // ### getFontFamilies
  // Web font files are generally distributed per weight and style (bold, italic).
  // return the family with the attributes that are available for that font.
  // We assume descriptions are the same for different weights/styles.
  static getFontFamilies(): TextFontInfo[] {
    const hash: Record<string, TextFontInfo> = {};
    const returnedFonts: TextFontInfo[] = [];
    TextFont.fontRegistry.forEach((font) => {
      if (!hash[font.family]) {
        hash[font.family] = {
          family: font.family,
          description: font.description,
          bold: font.bold,
          serifs: font.serifs,
          italic: font.italic,
        };
      } else {
        ['bold', 'italic', 'monospaced', 'serifs'].forEach((attr) => {
          if (font[attr]) {
            hash[font.family][attr] = true;
          }
        });
      }
    });
    const keys = Object.keys(hash);
    keys.forEach((key) => {
      returnedFonts.push(hash[key]);
    });
    return returnedFonts;
  }

  // ### textWidthCache
  // Static cache of widths hashed on font/string.
  static get textWidthCache(): Record<string, Record<string, number>> {
    if (typeof TextFont.textWidthCacheInstance === 'undefined') {
      TextFont.textWidthCacheInstance = {};
    }
    return TextFont.textWidthCacheInstance;
  }

  /**
   * Find the font that most closely matches the parameters from the given font data.
   * We look for font family, bold, and italic attributes.
   * This method will always return a fallback font if there are no matches.
   */
  static createTextFont(fontInfo: FontInfo = {}): TextFont {
    let candidates: TextFontInfo[] = [];
    if (!fontInfo.family) {
      fontInfo.family = TextFont.SANS_SERIF;
    }
    const families = fontInfo.family.split(',');
    for (const family of families) {
      candidates = TextFont.fontRegistry.filter((font) => font.family === family);
      if (candidates.length) {
        break;
      }
    }

    let selectedFont;
    if (candidates.length === 0) {
      // No match, so return a fallback font.
      selectedFont = new TextFont(TextFont.fontRegistry[0]);
    } else if (candidates.length === 1) {
      selectedFont = new TextFont(candidates[0]);
    } else {
      const bold = isBold(fontInfo.weight);
      const italic = isItalic(fontInfo.style);
      const perfectMatch = candidates.find((fontInfo) => fontInfo.bold === bold && fontInfo.italic === italic);
      if (perfectMatch) {
        selectedFont = new TextFont(perfectMatch);
      } else {
        const partialMatch = candidates.find((fontInfo) => fontInfo.italic === italic || fontInfo.bold === bold);
        if (partialMatch) {
          selectedFont = new TextFont(partialMatch);
        } else {
          selectedFont = new TextFont(candidates[0]);
        }
      }
    }
    if (typeof fontInfo.size === 'number' && fontInfo.size > 0) {
      selectedFont.setFontSize(fontInfo.size);
    }
    return selectedFont;
  }

  static getFontDataByName(fontName: string): TextFontInfo | undefined {
    return TextFont.fontRegistry.find((fontInfo) => fontInfo.name === fontName);
  }

  // ### registerFont
  // Applications may register their own fonts and the metrics, and those metrics
  // will be available to the application for formatting.  See fontRegistry
  // for format of font metrics.  Metrics can be generated from any font file
  // using textmetrics_fontgen.js in the tools/smufl directory.
  static registerFont(fontInfo: TextFontInfo, overwrite?: boolean): void {
    // Use the external getter to make sure initial object is created.
    const exists = TextFont.fontRegistry.find((tf) => fontInfo.name === tf.name);
    if (exists && overwrite) {
      TextFont.registryInstance = TextFont.fontRegistry.filter((fd) => fd.name !== exists.name);
    }
    if (!exists) {
      L('Registering font ' + fontInfo.name);
      TextFont.registryInstance.push(fontInfo);
    }
  }

  /**
   * 16pt * 3 = 48pt
   * 8px / 2 = 4px
   * @param size
   * @param scaleFactor
   * @returns
   */
  static scaleFontSize(size: number | string | undefined, scaleFactor: number): string | number | undefined {
    if (size === undefined) return undefined;
    if (typeof size === 'number') {
      return size * scaleFactor;
    } else {
      const value = parseInt(size);
      const unit = size.replace(/[\d\s]/g, ''); // Remove all numbers and spaces.
      return `${value * scaleFactor}${unit}`;
    }
  }

  resolution: number = 1000;
  protected name?: string;
  protected glyphs: Record<string, TextFontMetrics> = {};
  protected family: string = '';
  protected serifs?: boolean;
  protected monospaced?: boolean;
  protected italic?: boolean;
  protected bold?: boolean;
  protected superscriptOffset?: number;
  protected subscriptOffset?: number;
  protected description?: string;
  protected maxSizeGlyph: string;
  protected weight: string;
  protected style: string;
  protected fontCacheKey: string = '';
  /** Specified in pt units. */
  protected size: number;
  protected attrs: { type: string };

  /** The preferred method for returning an instance of this class is via `TextFont.createTextFont()` */
  constructor(params: TextFontInfo) {
    this.size = 14;
    this.maxSizeGlyph = 'H';
    this.weight = 'normal';
    this.style = 'normal';
    this.attrs = { type: TextFont.CATEGORY };
    if (!params.name) {
      throw new RuntimeError('BadArgument', 'Font constructor must specify a name');
    }
    const fontData = params.glyphs ? params : TextFont.getFontDataByName(params.name);
    if (!fontData) {
      if (params.glyphs && params.resolution) {
        TextFont.registerFont(params);
      } else {
        throw new RuntimeError('BadArgument', 'Unknown font, must have glyph metrics and resolution');
      }
    } else {
      this.updateParams(fontData);
    }
    this.updateParams(params);

    this.updateCacheKey();
  }

  updateParams(params: TextFontInfo): void {
    if (params.name) this.name = params.name;
    if (params.resolution) this.resolution = params.resolution;
    if (params.glyphs) this.glyphs = params.glyphs;
    this.family = params.family;
    this.serifs = params.serifs;
    if (params.monospaced) this.monospaced = params.monospaced;
    this.italic = params.italic;
    this.bold = params.bold;
    if (params.maxSizeGlyph) this.maxSizeGlyph = params.maxSizeGlyph;
    if (params.superscriptOffset) this.superscriptOffset = params.superscriptOffset;
    if (params.subscriptOffset) this.subscriptOffset = params.subscriptOffset;
  }

  // Create a hash with the current font data, so we can cache computed widths
  updateCacheKey(): void {
    this.fontCacheKey = `${this.family}-${this.size}-${this.weight}-${this.style}`;
  }

  getMetricForCharacter(c: string): TextFontMetrics {
    if (this.glyphs[c]) {
      return this.glyphs[c];
    }
    return this.glyphs[this.maxSizeGlyph];
  }

  get maxHeight(): number {
    const glyph = this.getMetricForCharacter(this.maxSizeGlyph);
    return (glyph.ha / this.resolution) * this.pointsToPixels;
  }

  getWidthForCharacter(c: string): number {
    const metric = this.getMetricForCharacter(c);
    if (!metric) {
      return 0.65 * this.pointsToPixels;
    }
    return (metric.advanceWidth / this.resolution) * this.pointsToPixels;
  }

  getWidthForString(s: string): number {
    // Store width in 2-level cache, so I don't have to recompute for
    // same string/font
    if (typeof TextFont.textWidthCache[this.fontCacheKey] === 'undefined') {
      TextFont.textWidthCache[this.fontCacheKey] = {};
    }
    let width = 0;
    if (!TextFont.textWidthCache[this.fontCacheKey][s]) {
      for (let j = 0; j < s.length; ++j) {
        width += this.getWidthForCharacter(s[j]);
      }
      TextFont.textWidthCache[this.fontCacheKey][s] = width;
    }
    return TextFont.textWidthCache[this.fontCacheKey][s];
  }

  // The font size is specified in points, convert to 'pixels' in the SVG space
  get pointsToPixels(): number {
    return (this.size * 4) / 3;
  }

  setFontSize(size: number): this {
    this.size = size;
    // font size mangled into cache key, so use the correct one.
    this.updateCacheKey();
    return this;
  }
}
