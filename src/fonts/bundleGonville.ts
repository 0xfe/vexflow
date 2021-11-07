// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-gonville.js bundles the Gonville music engraving font.

import { Flow } from '../flow';
import { Font } from '../font';
import { setupAsyncFontLoader } from './async';
import { Gonville } from './gonville';

export function loadMusicFonts(): void {
  const font = Font.load('Gonville', Gonville.data, Gonville.metrics);
  // Other music fonts will be loaded dynamically, when `Flow.setMusicFont(fontName)` is called.
  setupAsyncFontLoader();
  Flow.setMusicFontStack([font]);
}
