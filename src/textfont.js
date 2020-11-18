// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file handles a registry of text font metric information, so all
// VEX modules can take advantage of font metrics in a uniform way.
//

import { Vex } from './vex';
import { PetalumaScriptTextMetrics } from './fonts/petalumascript_textmetrics';
import { RobotoSlabTextMetrics } from './fonts/robotoslab_textmetrics';

// To enable logging for this class. Set `Vex.Flow.TextFont.DEBUG` to `true`.
function L(...args) { if (TextFont.DEBUG) Vex.L('Vex.Flow.TextFont', args); }

export class TextFont  {
  static get CATEGORY() { return 'textFont'; }

  static get DEBUG() {
    return TextFont.debug;
  }
  static set DEBUG(val) {
    TextFont.debug = val;
  }

  // ### fontRegistry
  // Getter of an array of available fonts.  Applications may register their
  // own fonts and the metrics for those fonts will be available to the
  // application.
  static get fontRegistry() {
    if (!TextFont.registryInstance) {
      TextFont.registryInstance = [];
      TextFont.registryInstance.push({
        name: 'RobotoSlab',
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
        description: 'Default sans-serif text font to pair with Petaluma engraving font',
      });
    }
    return TextFont.registryInstance;
  }

  // ### getFontFamilies
  // Web font files are generally distributed per weight and style (bold, italic).
  // return the family with the attributes that are available for that font.
  // We assume descriptions are the same for different weights/styles.
  static getFontFamilies() {
    const hash = {};
    const rv = [];
    TextFont.fontRegistry.forEach((font) => {
      if (!hash[font.family]) {
        hash[font.family] = { family: font.family, description: font.description,
          bold: font.bold, serifs: font.serifs, italic: font.italic };
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
      rv.push(hash[key]);
    });
    return rv;
  }

  // ### fontWeightToBold
  // return true if the font weight indicates we desire a 'bold'
  // used in getTextFontFromVexFontData
  static fontWeightToBold(fw) {
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
  static  fontStyleToItalic(fs) {
    return (fs && typeof(fs) === 'string' && fs.toLowerCase() === 'italic');
  }

  // ### getTextFontFromVexFontData
  // Find the font that most closely matches the parameters from the given font data.
  // Primarily we look for font family, also bold and italic attributes.  This
  // method will always return a fallback font if there are no matches.
  static getTextFontFromVexFontData(fd) {
    let i = 0;
    const fallback = TextFont.fontRegistry[0];
    let candidates = [];
    const families = fd.family.split(',');
    for (i = 0; i < families.length; ++i) {
      const famliy = families[i];
      candidates = TextFont.fontRegistry.filter((font) => font.family === famliy);
      if (candidates.length) {
        break;
      }
    }
    if (candidates.length === 0) {
      return new TextFont(fallback);
    }
    if (candidates.length === 1) {
      return new TextFont(candidates[0]);
    }
    const bold = TextFont.fontWeightToBold(fd.weight);
    const italic = TextFont.fontStyleToItalic(fd.style);

    const perfect = candidates.find((font) => font.bold === bold && font.italic === italic);
    if (perfect) {
      return new TextFont(perfect);
    }
    const ok = candidates.find((font) => font.italic === italic || font.bold === bold);
    if (ok) {
      return new TextFont(ok);
    }
    return new TextFont(candidates[0]);
  }

  static getFontDataByName(fontName)  {
    return TextFont.fontRegistry.find((fd) => fd.name === fontName);
  }

  // ### registerFont
  // Applications may register their own fonts and the metrics, and those metrics
  // will be available to the application for formatting.  See fontRegistry
  // for format of font metrics.  Metrics can be generated from any font file
  // using font_fontgen.js in the tools/smufl directory.
  static registerFont(fontData, overwrite) {
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
  constructor(params) {
    this.attrs = { 'type': 'TextFont' };
    if (!params.name) {
      Vex.RERR('BadArgument', 'Font constructor must specify a name');
    }
    const fontData = params.glyphs ? params : TextFont.getFontDataByName(params.name);
    if (!fontData) {
      if (params.glyphs && params.resolution) {
        TextFont.registerFont(params);
      } else {
        Vex.RERR('BadArgument', 'Unknown font, must have glyph metrics and resolution');
      }
    } else {
      Vex.Merge(this, fontData);
    }
    Vex.Merge(this, params);

    if (!this.size) {
      this.size = 14;
    }
    if (!this.maxSizeGlyph) {
      this.maxSizeGlyph = 'H';
    }
  }

  getMetricForCharacter(c) {
    if (this.glyphs[c]) {
      return this.glyphs[c];
    }
    return this.glyphs[this.maxSizeGlyph];
  }

  get maxHeight() {
    const glyph = this.getMetricForCharacter(this.maxSizeGlyph);
    return  (glyph.ha / this.resolution) *  this.pointsToPixels;
  }

  getWidthForCharacter(c) {
    const metric = this.getMetricForCharacter(c);
    if (!metric) {
      return 0.65 * this.pointsToPixels;
    }
    return (metric.advanceWidth / this.resolution) * this.pointsToPixels;
  }

  // ### pointsToPixels
  // The font size is specified in points, convert to 'pixels' in the svg space
  get pointsToPixels() {
    return (this.size / 72) / (1 / 96);
  }

  setFontSize(size) {
    this.size = size;
    return this;
  }
}
