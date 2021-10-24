import { Font } from '../font';
import { TextFormatter } from '../textformatter';
import { PetalumaScriptFont } from './petalumascript_glyphs';
import { RobotoSlabFont } from './robotoslab_glyphs';

export function loadTextFonts() {
  {
    const fontData = RobotoSlabFont;
    const fontName = fontData.name;
    const font = Font.get(fontName);
    font.data = fontData;
    TextFormatter.registerFont({
      name: fontName,
      family: fontData.fontFamily,
      resolution: fontData.resolution,
      glyphs: fontData.glyphs,
      monospaced: false,
      italic: false,
      bold: false,
      maxSizeGlyph: 'H',
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: true,
      description: 'Default text font to pair with the Bravura / Gonville engraving fonts.',
    });
  }

  {
    const fontData = PetalumaScriptFont;
    const fontName = fontData.name;
    const font = Font.get(fontName);
    font.data = fontData;
    TextFormatter.registerFont({
      name: fontName,
      family: fontData.fontFamily,
      resolution: fontData.resolution,
      glyphs: fontData.glyphs,
      monospaced: false,
      italic: false,
      bold: false,
      maxSizeGlyph: 'H',
      superscriptOffset: 0.66,
      subscriptOffset: 0.66,
      serifs: false,
      description: 'Default text font to pair with the Petaluma engraving font.',
    });
  }
}
