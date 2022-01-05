// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-petaluma.ts is the entry point for vexflow-petaluma.js.
// This version bundles the Petaluma music engraving font.

import { Vex } from '../src/vex';

import { Flow } from '../src/flow';
import { loadCustom } from '../src/fonts/load_custom';
import { loadPetaluma } from '../src/fonts/load_petaluma';
import { loadTextFonts } from '../src/fonts/textfonts';

loadPetaluma();
loadCustom();
Flow.setMusicFont('Petaluma', 'Custom');
loadTextFonts();

export * from '../src/index';
export default Vex;
