// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// allFontsDebug.ts is the entry point for the build output file: `vexflow-debug.js`.
// It statically bundles all the music engraving fonts.

import Vex from '../vex';

import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();
loadTextFonts();

export default Vex;
