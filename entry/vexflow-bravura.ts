// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-bravura.ts is the entry point for vexflow-bravura.js.
// This version bundles the Bravura music engraving font.

import { Vex } from '../src/vex';

import { Flow } from '../src/flow';
import { loadBravura } from '../src/fonts/load_bravura';
import { loadCustom } from '../src/fonts/load_custom';
import { loadTextFonts } from '../src/fonts/textfonts';

loadBravura();
loadCustom();
Flow.setMusicFont('Bravura', 'Custom');
loadTextFonts();

export * from '../src/index';
export default Vex;
