// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-core-with-bravura.js bundles the Bravura music engraving font.

import { Flow } from '../flow';
import { Font } from '../font';
import { setupAsyncFontLoader } from './async';
import { Bravura } from './bravura';

export function loadMusicFonts(): void {
  Font.load('Bravura', Bravura.data, Bravura.metrics);
  // Other music fonts will be loaded dynamically, when `Flow.setMusicFont(...fontNames)` is called.
  setupAsyncFontLoader();
  Flow.setMusicFont('Bravura');
}
