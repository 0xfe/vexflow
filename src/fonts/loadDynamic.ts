// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Sets up an async function for dynamic loading of music engraving fonts.
//

import { Flow } from '../flow';
import { Font } from '../font';

export function setupMusicFonts(): void {
  Flow.setMusicFont = async (...fontNames: string[]) => {
    // Make sure each individual font is loaded before we proceed to call Flow.setMusicFontStack(...).
    for (const fontName of fontNames) {
      const font = Font.load(fontName);
      if (font.hasData()) {
        // This font has been loaded before.
        console.log('We have already loaded: ' + fontName);
        console.log(font.getData());
        // TODO/RONYEH REMOVE!
        continue;
      }

      switch (fontName) {
        case 'Bravura': {
          const module = await import(/* webpackChunkName: "bravura" */ '../fonts/bravura');
          font.setDataAndMetrics(module.default);
          break;
        }
        case 'Gonville': {
          const module = await import(/* webpackChunkName: "gonville" */ '../fonts/gonville');
          font.setDataAndMetrics(module.default);
          break;
        }
        case 'Petaluma': {
          const module = await import(/* webpackChunkName: "petaluma" */ '../fonts/petaluma');
          font.setDataAndMetrics(module.default);
          break;
        }
        case 'Custom': {
          const module = await import(/* webpackChunkName: "custom" */ '../fonts/custom');
          font.setDataAndMetrics(module.default);
          break;
        }
        default: {
          console.log('Unknown music font: ' + fontName);
        }
      }
    }

    // Convert an array of font names into an array of Font objects.
    Flow.setMusicFontStack(fontNames.map((fontName) => Font.load(fontName)));
  };
}
