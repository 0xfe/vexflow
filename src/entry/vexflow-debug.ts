// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-debug.ts is the entry point for the build output file vexflow-debug.js.
// It statically bundles all the music engraving fonts.

import { Vex } from '../';
import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();
loadTextFonts();

export * from '../';
export default Vex;
