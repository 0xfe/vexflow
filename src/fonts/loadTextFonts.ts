import { Font } from '../font';
import { TextFormatter } from '../textformatter';
import { RobotoSlabFont } from './robotoslab_glyphs';
import { PetalumaScriptFont } from './petalumascript_glyphs';

export function loadTextFonts() {
  // Roboto Slab
  {
    const fontData = RobotoSlabFont;
    const { fontFamily, resolution, glyphs } = fontData;
    Font.load(fontFamily, fontData);
    // H isn't actually the tallest or the widest.
    // Interestingly, the lowercase b is the tallest.
    const maxSizeGlyph = 'H';
    // const maxSizeGlyph = 'b'; // TODO/RONYEH: introduces a visual diff.
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
      description: 'Default text font to pair with the Bravura / Gonville engraving fonts.',
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
      description: 'Default text font to pair with the Petaluma engraving font.',
    });
  }
}
