// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Sets up an async function for dynamic loading of music engraving fonts.
//

import { Flow } from '../flow';
import { Font } from '../font';
import { RuntimeError } from '../util';

export function loadMusicFonts(): void {
  // Keep the synchronous function around so we can call it later.
  const setMusicFontSync = Flow.setMusicFont;

  // Replace Flow.setMusicFont(...fontNames) with this async function.
  // @ts-ignore override with a function that has a different return type.
  Flow.setMusicFont = async (...fontNames: string[]): Promise<Font | Font[]> => {
    // Make sure each individual font is loaded before we proceed.
    for (const fontName of fontNames) {
      const font = Font.load(fontName);
      // Check if the font data has already been loaded.
      if (font.hasData()) {
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
          throw new RuntimeError('UnknownMusicFont', `Music font ${fontName} does not exist.`);
        }
      }
    }

    // The fonts are ready! Now it's time to call the synchronous function.
    return setMusicFontSync(...fontNames);
  };
}
