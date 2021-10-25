import { Flow } from '../flow';
import { Font } from '../font';
import Bravura from '../fonts/bravura';
import Gonville from '../fonts/gonville';
import Petaluma from '../fonts/petaluma';
import Custom from '../fonts/custom';
import { loadTextFonts } from './loadTextFonts';

export function setupFonts(): void {
  Flow.setMusicFont = (...fontNames: string[]) => {
    Flow.MUSIC_FONT_STACK = fontNames.map((fontName) => Font.get(fontName));
  };

  const fontBravura = Font.get('Bravura');
  fontBravura.data = Bravura.data;
  fontBravura.metrics = Bravura.metrics;

  const fontGonville = Font.get('Gonville');
  fontGonville.data = Gonville.data;
  fontGonville.metrics = Gonville.metrics;

  const fontPetaluma = Font.get('Petaluma');
  fontPetaluma.data = Petaluma.data;
  fontPetaluma.metrics = Petaluma.metrics;

  const fontCustom = Font.get('Custom');
  fontCustom.data = Custom.data;
  fontCustom.metrics = Custom.metrics;

  // vexflow.js uses the following default font stack:
  Flow.setMusicFont('Bravura', 'Gonville', 'Custom');

  loadTextFonts();
}
