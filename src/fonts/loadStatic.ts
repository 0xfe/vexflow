// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Preloads all of our music engraving fonts.

import { Flow } from '../flow';
import { Font } from '../font';
import Bravura from '../fonts/bravura';
import Gonville from '../fonts/gonville';
import Petaluma from '../fonts/petaluma';
import Custom from '../fonts/custom';

export function loadMusicFonts(): void {
  // Populate our font "database" with all our music engraving fonts.
  const bravuraFont = Font.load('Bravura', Bravura.data, Bravura.metrics);
  const gonvilleFont = Font.load('Gonville', Gonville.data, Gonville.metrics);
  Font.load('Petaluma', Petaluma.data, Petaluma.metrics);
  const customFont = Font.load('Custom', Custom.data, Custom.metrics);

  // vexflow.js uses the following default font stack:
  Flow.setMusicFontStack([bravuraFont, gonvilleFont, customFont]);
}
