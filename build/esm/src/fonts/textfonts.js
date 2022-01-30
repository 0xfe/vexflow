import { Font } from '../font.js';
import { TextFormatter } from '../textformatter.js';
import { PetalumaScriptFont } from './petalumascript_glyphs.js';
import { RobotoSlabFont } from './robotoslab_glyphs.js';
export function loadTextFonts() {
    {
        const fontData = RobotoSlabFont;
        const { fontFamily, resolution, glyphs } = fontData;
        Font.load(fontFamily, fontData);
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
    {
        const fontData = PetalumaScriptFont;
        const { fontFamily, resolution, glyphs } = fontData;
        Font.load(fontFamily, fontData);
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
