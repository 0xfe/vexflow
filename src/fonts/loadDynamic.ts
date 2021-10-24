import { Flow } from '../flow';
import { Font } from '../font';
import { loadTextFonts } from './loadTextFonts';

export function setupFonts(): void {
  Flow.setMusicFont = async (...fontNames: string[]) => {
    for (const fontName of fontNames) {
      const font = Font.get(fontName);
      if (font.data !== undefined) {
        // This font has been loaded before.
        console.log('We have already loaded: ' + fontName);
        console.log(font.data);
        continue;
      }

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
        default: {
          console.log('Unknown music font: ' + fontName);
        }
      }
    }

    Flow.MUSIC_FONT_STACK = fontNames.map((fontName) => Font.get(fontName));
  };

  loadTextFonts();
}
