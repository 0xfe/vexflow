// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-petaluma.js bundles the Petaluma music engraving font.

import { Flow } from '../flow';
import { Font } from '../font';
import { setupAsyncFontLoader } from './async';
import { Petaluma } from './petaluma';

export function loadMusicFonts(): void {
  console.log('bundlePetaluma');

  const font = Font.load('Petaluma', Petaluma.data, Petaluma.metrics);
  // Other music fonts will be loaded dynamically, when `Flow.setMusicFont(fontName)` is called.
  setupAsyncFontLoader();
  Flow.setMusicFontStack([font]);
}
