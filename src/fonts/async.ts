// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// @author Ron B. Yeh

import { Flow } from '../flow';
import { Font } from '../font';
import { RuntimeError } from '../util';

/**
 * Call this to convert `Flow.setMusicFont(...)` to an async function which
 * supports dynamic font loading.
 */
export function setupAsyncFontLoader() {
  // Keep the synchronous function around so we can call it later.
  const setMusicFontSync = Flow.setMusicFont;

  // Replace Flow.setMusicFont(...fontNames) with this async function.
  // eslint-disable-next-line
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
          const module = await import(/* webpackChunkName: "bravura" */ './bravura');
          font.setDataAndMetrics(module.Bravura);
          break;
        }
        case 'Gonville': {
          const module = await import(/* webpackChunkName: "gonville" */ './gonville');
          font.setDataAndMetrics(module.Gonville);
          break;
        }
        case 'Petaluma': {
          const module = await import(/* webpackChunkName: "petaluma" */ './petaluma');
          font.setDataAndMetrics(module.Petaluma);
          break;
        }
        case 'Custom': {
          const module = await import(/* webpackChunkName: "custom" */ './custom');
          font.setDataAndMetrics(module.Custom);
          break;
        }
        default: {
          throw new RuntimeError('UnknownFont', `Music font ${fontName} does not exist.`);
        }
      }
    }

    // The fonts are ready! Now it's time to call the synchronous function.
    return setMusicFontSync(...fontNames);
  };
}
