// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { TextFormatter } from '../textformatter';
import { PetalumaScriptFont } from './petalumascript_glyphs';
import { RobotoSlabFont } from './robotoslab_glyphs';

export function loadTextFonts() {
  // Roboto Slab
  {
    const fontData = RobotoSlabFont;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // H isn't actually the tallest or the widest.
    // Interestingly, the lowercase b is the tallest.
    const maxSizeGlyph = 'H'; // Two lines of lyrics touch each other because we don't allow enough vertical space.
    // const maxSizeGlyph = 'b'; // RONYEH: introduces a visual diff, but the spacing is better.
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
    // M is wider, but H is taller. :-) We continue to use H for consistency / legacy reasons.
    // Lowercase b is also taller in this font.
    const maxSizeGlyph = 'H';
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
      description: 'Ttext font to pair with the Petaluma music font.',
    });
  }
}
