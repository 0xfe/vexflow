// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// allFontsDebug.ts is the entry point for the build output file: `vexflow-debug.js`.
// It statically bundles all the music engraving fonts.

import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';
import { Vex } from '../index';

loadMusicFonts();
loadTextFonts();

console.log('entry/allFontsDebug');

export * from '../index';
export default Vex;
