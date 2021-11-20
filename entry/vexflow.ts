// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow.ts is the entry point for the build output file vexflow.js.
// It statically bundles all the music engraving fonts, and
// automatically sets the music font stack to: Flow.setMusicFont('Bravura', 'Gonville', 'Custom');

// Currently, the code is identical to vexflow-debug.ts, but the webpack config inside Gruntfile.js
// sets the webpack mode to 'production' to produce a minified build.

// In the future, we could do something different with this entry file, such as globally disabling
// error checks, or some other fun optimization.

import { Vex } from '../src/index';

import { loadMusicFonts } from '../src/fonts/bundleAllMusicFonts';
import { loadTextFonts } from '../src/fonts/textfonts';

loadMusicFonts();
loadTextFonts();

export * from '../src/index';
export default Vex;
