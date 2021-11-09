// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-core-with-gonville.js bundles the Gonville music engraving font.

import { Flow } from '../flow';
import { Font } from '../font';
import { setupAsyncFontLoader } from './async';
import { Gonville } from './gonville';

export function loadMusicFonts(): void {
  Font.load('Gonville', Gonville.data, Gonville.metrics);
  // Other music fonts will be loaded dynamically, when `Flow.setMusicFont(...fontNames)` is called.
  setupAsyncFontLoader();
  Flow.setMusicFont('Gonville');
}
