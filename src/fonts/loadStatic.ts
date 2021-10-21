import { Flow } from '../flow';
import { Font, Fonts } from '../font';
import Bravura from '../fonts/bravura';
import Gonville from '../fonts/gonville';
import Petaluma from '../fonts/petaluma';
import Custom from '../fonts/custom';
import { RobotoSlabFont } from './robotoslab_glyphs';
import { PetalumaScriptFont } from './petalumascript_glyphs';

export function setupFonts(): void {
  Flow.setMusicFont = (...fontNames: string[]) => {
    Flow.MUSIC_FONT_STACK = fontNames.map((fontName) => Font.get(fontName));
  };

  const fontBravura = new Font('Bravura');
  fontBravura.data = Bravura.data;
  fontBravura.metrics = Bravura.metrics;
  Fonts['Bravura'] = fontBravura;

  const fontGonville = new Font('Gonville');
  fontGonville.data = Gonville.data;
  fontGonville.metrics = Gonville.metrics;
  Fonts['Gonville'] = fontGonville;

  const fontPetaluma = new Font('Petaluma');
  fontPetaluma.data = Petaluma.data;
  fontPetaluma.metrics = Petaluma.metrics;
  Fonts['Petaluma'] = fontPetaluma;

  const fontCustom = new Font('Custom');
  fontCustom.data = Custom.data;
  fontCustom.metrics = Custom.metrics;
  Fonts['Custom'] = fontCustom;

  const fontRobotoSlab = new Font('Roboto Slab');
  fontRobotoSlab.data = RobotoSlabFont;
  fontRobotoSlab.metrics = undefined;
  Fonts['Roboto Slab'] = fontRobotoSlab;

  const fontPetalumaScript = new Font('PetalumaScript');
  fontPetalumaScript.data = PetalumaScriptFont;
  fontPetalumaScript.metrics = undefined;
  Fonts['PetalumaScript'] = fontPetalumaScript;
}
