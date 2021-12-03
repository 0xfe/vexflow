// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow.ts is the entry point for the build output file vexflow.js.
// It statically bundles all the music engraving fonts, and sets the music font stack to:
// Flow.setMusicFont('Bravura', 'Gonville', 'Custom');

// The webpack config inside Gruntfile.js sets the mode to 'production' to produce a minified build.

import { Vex } from '../src/vex';

import { Flow } from '../src/flow';
import { loadAllMusicFonts } from '../src/fonts/load_all';
import { loadTextFonts } from '../src/fonts/textfonts';

loadAllMusicFonts();
Flow.setMusicFont('Bravura', 'Gonville', 'Custom');
loadTextFonts();

export * from '../src/index';
export default Vex;
