// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file handles a registry of text font metric information, so all
// VEX modules can take advantage of font metrics in a uniform way.
//

import { RuntimeError, log } from './util';
import { PetalumaScriptTextMetrics } from './fonts/petalumascript_textmetrics';
import { RobotoSlabTextMetrics } from './fonts/robotoslab_textmetrics';
import { FontInfo } from './types/common';

export interface TextFontMetrics {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  ha: number;
  leftSideBearing: number;
  advanceWidth: number;
}

export interface TextFontRegistry {
  [name: string]: unknown;
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

// To enable logging for this class. Set `Vex.Flow.TextFont.DEBUG` to `true`.
function L(
  // eslint-disable-next-line
  ...args: any[]) {
  if (TextFont.DEBUG) log('Vex.Flow.TextFont', args);
}

export class TextFont {
  protected static debug: boolean;
  protected resolution: number = 1000;
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

  protected static registryInstance: TextFontRegistry[];
  protected static textWidthCacheInstance?: Record<string, Record<string, number>>;

  protected size: number;
  protected attrs: { type: string };

  static get CATEGORY(): string {
    return 'textFont';
  }

  static get DEBUG(): boolean {
    return TextFont.debug;
  }

  static set DEBUG(val: boolean) {
    TextFont.debug = val;
  }

  // ### fontRegistry
  // Getter of an array of available fonts.  Applications may register their
  // own fonts and the metrics for those fonts will be available to the
  // application.
  static get fontRegistry(): TextFontRegistry[] {
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
        description: 'Default serif text font to pair with Bravura/Gonville engraving font',
      });
      TextFont.registryInstance.push({
        name: 'petalumaScript',
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
        description: 'Default sans-serif text font to pair with Petaluma engraving font',
      });
    }
    return TextFont.registryInstance;
  }

  // ### getFontFamilies
  // Web font files are generally distributed per weight and style (bold, italic).
  // return the family with the attributes that are available for that font.
  // We assume descriptions are the same for different weights/styles.
  static getFontFamilies(): TextFontRegistry[] {
    const hash: Record<string, TextFontRegistry> = {};
    const returnedFonts: TextFontRegistry[] = [];
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

  // ### fontWeightToBold
  // return true if the font weight indicates we desire a 'bold'
  // used in getTextFontFromVexFontData
  static fontWeightToBold(fw?: string): boolean {
    if (!fw) {
      return false;
    }
    if (isNaN(parseInt(fw, 10))) {
      return fw.toLowerCase() === 'bold';
    }
    // very subjective...
    return parseInt(fw, 10) >= 600;
  }

  // ### fontStyleToItalic
  // return true if the font style indicates we desire 'italic' style
  // used in getTextFontFromVexFontData
  static fontStyleToItalic(fs?: string): boolean {
    return typeof fs === 'string' && fs.toLowerCase() === 'italic';
  }

  // ### textWidthCache
  // Static cache of widths hashed on font/string.
  static get textWidthCache(): Record<string, Record<string, number>> {
    if (typeof TextFont.textWidthCacheInstance === 'undefined') {
      TextFont.textWidthCacheInstance = {};
    }
    return TextFont.textWidthCacheInstance;
  }

  // ### getTextFontFromVexFontData
  // Find the font that most closely matches the parameters from the given font data.
  // Primarily we look for font family, also bold and italic attributes.  This
  // method will always return a fallback font if there are no matches.
  static getTextFontFromVexFontData(fd: FontInfo): TextFont {
    let i = 0;
    let selectedFont = undefined;
    const fallback = TextFont.fontRegistry[0];
    let candidates: TextFontRegistry[] = [];
    const families = fd.family.split(',');
    for (i = 0; i < families.length; ++i) {
      const famliy = families[i];
      candidates = TextFont.fontRegistry.filter((font) => font.family === famliy);
      if (candidates.length) {
        break;
      }
    }
    if (candidates.length === 0) {
      selectedFont = new TextFont(fallback);
    } else if (candidates.length === 1) {
      selectedFont = new TextFont(candidates[0]);
    } else {
      const bold = TextFont.fontWeightToBold(fd.weight);
      const italic = TextFont.fontStyleToItalic(fd.style);
      const perfect = candidates.find((font) => font.bold === bold && font.italic === italic);
      if (perfect) {
        selectedFont = new TextFont(perfect);
      } else {
        const ok = candidates.find((font) => font.italic === italic || font.bold === bold);
        if (ok) {
          selectedFont = new TextFont(ok);
        } else {
          selectedFont = new TextFont(candidates[0]);
        }
      }
    }
    if (typeof fd.size === 'number' && fd.size > 0) {
      selectedFont.setFontSize(fd.size);
    }
    return selectedFont;
  }

  static getFontDataByName(fontName: string): TextFontRegistry | undefined {
    return TextFont.fontRegistry.find((fd) => fd.name === fontName);
  }

  // ### registerFont
  // Applications may register their own fonts and the metrics, and those metrics
  // will be available to the application for formatting.  See fontRegistry
  // for format of font metrics.  Metrics can be generated from any font file
  // using font_fontgen.js in the tools/smufl directory.
  static registerFont(fontData: TextFontRegistry, overwrite?: boolean): void {
    // Get via external reference to make sure initial object is created
    const reg = TextFont.fontRegistry;
    const exists = reg.find((td) => fontData.name === td.name);
    if (exists && overwrite) {
      TextFont.registryInstance = TextFont.fontRegistry.filter((fd) => fd.name !== exists.name);
    }
    if (!exists) {
      L('registering font ' + fontData.name);
      TextFont.registryInstance.push(fontData);
    }
  }

  // ## Prototype Methods
  //
  // create a font instance.
  // The preferred method for returning an instance of this class is via
  // getTextFontFromVexFontData
  constructor(params: TextFontRegistry) {
    this.size = 14;
    this.maxSizeGlyph = 'H';
    this.weight = '';
    this.style = '';
    this.attrs = { type: 'TextFont' };
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

  updateParams(params: TextFontRegistry): void {
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

  // ### pointsToPixels
  // The font size is specified in points, convert to 'pixels' in the svg space
  get pointsToPixels(): number {
    return this.size / 72 / (1 / 96);
  }

  setFontSize(size: number): this {
    this.size = size;
    // font size mangled into cache key, so use the correct one.
    this.updateCacheKey();
    return this;
  }
}
