import { Flow } from '../flow';
import { Font, Fonts } from '../font';
import { PetalumaScriptFont } from './petalumascript_glyphs';
import { RobotoSlabFont } from './robotoslab_glyphs';

export function setupFonts(): void {
  console.log('Setup Fonts in loadDynamic!');

  Flow.setMusicFont = async (...fontNames: string[]) => {
    // Make sure each font is loaded before proceeding.
    for (const fontName of fontNames) {
      if (!Fonts[fontName]) {
        Fonts[fontName] = new Font(fontName);
      }

      const font = Fonts[fontName];
      switch (fontName) {
        case 'Bravura': {
          const module = await import(/* webpackChunkName: "bravura" */ '../fonts/bravura');
          font.data = module.default.data;
          font.metrics = module.default.metrics;
          break;
        }
        case 'Gonville': {
          const module = await import(/* webpackChunkName: "gonville" */ '../fonts/gonville');
          font.data = module.default.data;
          font.metrics = module.default.metrics;
          break;
        }
        case 'Petaluma': {
          const module = await import(/* webpackChunkName: "petaluma" */ '../fonts/petaluma');
          font.data = module.default.data;
          font.metrics = module.default.metrics;
          break;
        }
        case 'Custom': {
          const module = await import(/* webpackChunkName: "custom" */ '../fonts/custom');
          font.data = module.default.data;
          font.metrics = module.default.metrics;
          break;
        }
      }
    }

    Flow.MUSIC_FONT_STACK = fontNames.map((fontName) => Font.get(fontName));
  };

  const fontRobotoSlab = new Font('Roboto Slab');
  fontRobotoSlab.data = RobotoSlabFont;
  Fonts['Roboto Slab'] = fontRobotoSlab;

  const fontPetalumaScript = new Font('PetalumaScript');
  fontPetalumaScript.data = PetalumaScriptFont;
  Fonts['PetalumaScript'] = fontPetalumaScript;
}
