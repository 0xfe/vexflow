// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow.js statically bundles & preloads all of our music engraving fonts.

import { Flow } from '../flow';
import { Font } from '../font';
import { Bravura } from './bravura';
import { Custom } from './custom';
import { Gonville } from './gonville';
import { Petaluma } from './petaluma';

export function loadMusicFonts(): void {
  // Populate our font "database" with all our music fonts.
  Font.load('Bravura', Bravura.data, Bravura.metrics);
  Font.load('Gonville', Gonville.data, Gonville.metrics);
  Font.load('Custom', Custom.data, Custom.metrics);
  Font.load('Petaluma', Petaluma.data, Petaluma.metrics);

  Flow.setMusicFont('Bravura', 'Gonville', 'Custom');
}
