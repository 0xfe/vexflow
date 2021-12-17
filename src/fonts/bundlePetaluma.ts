// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-core-with-petaluma.js bundles the Petaluma music engraving font.

import { Flow } from '../flow';
import { Font } from '../font';
import { setupAsyncFontLoader } from './async';
import { Petaluma } from './petaluma';

export function loadMusicFonts(): void {
  Font.load('Petaluma', Petaluma.data, Petaluma.metrics);
  // Other music fonts will be loaded dynamically, when `Flow.setMusicFont(...fontNames)` is called.
  setupAsyncFontLoader();
  Flow.setMusicFont('Petaluma');
}
