// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { TextFormatter } from '../textformatter';
import { PetalumaScriptFont } from './petalumascript_glyphs';
import { RobotoSlabFont } from './robotoslab_glyphs';
import { SansFontBold } from './sans_bold_text_metrics';
import { SansFont } from './sans_text_metrics';
import { SerifFont } from './serif_text_metrics';

export function loadTextFonts() {
  // Sans-serif fallback font, very close to Arial
  {
    const fontData = SansFontBold;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // Usually @ is the tallest and widest character, although not the
    // highest since it starts below the baseline.
    const maxSizeGlyph = '@';
    TextFormatter.registerInfo({
      family: fontFamily,
      resolution,
      glyphs,
      maxSizeGlyph,
      monospaced: false,
      bold: true,
      italic: false,
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: false,
      description: 'Generic SANS font',
    });
  }
  // Sans-serif fallback font, very close to Arial
  {
    const fontData = SansFont;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // Usually @ is the tallest and widest character, although not the
    // highest since it starts below the baseline.
    const maxSizeGlyph = '@';
    TextFormatter.registerInfo({
      family: fontFamily,
      resolution,
      glyphs,
      maxSizeGlyph,
      monospaced: false,
      bold: false,
      italic: false,
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: false,
      description: 'Generic SANS font',
    });
  }
  // Serif fallback font, very close to Times
  {
    const fontData = SerifFont;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // M is wider, but H is taller. :-)
    // Lowercase b is also taller in this font.
    const maxSizeGlyph = '@';
    TextFormatter.registerInfo({
      family: fontFamily,
      resolution,
      glyphs,
      maxSizeGlyph,
      monospaced: false,
      bold: false,
      italic: false,
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: true,
      description: 'Generic SERIF font',
    });
  }
  // Roboto Slab
  {
    const fontData = RobotoSlabFont;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // Previously we used 'H', but it isn't actually the tallest or the widest.
    // Interestingly, the lowercase 'b' is the tallest glyph.
    const maxSizeGlyph = 'b';
    TextFormatter.registerInfo({
      family: fontFamily,
      resolution,
      glyphs,
      maxSizeGlyph,
      monospaced: false,
      bold: false,
      italic: false,
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: true,
      description: 'Text font to pair with the Bravura / Gonville music fonts.',
    });
  }

  // PetalumaScript
  {
    const fontData = PetalumaScriptFont;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // M is wider, but H is taller. :-)
    // Lowercase b is also taller in this font.
    const maxSizeGlyph = 'b';
    TextFormatter.registerInfo({
      family: fontFamily,
      resolution,
      glyphs,
      maxSizeGlyph,
      monospaced: false,
      bold: false,
      italic: false,
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: false,
      description: 'Text font to pair with the Petaluma music font.',
    });
  }
}
