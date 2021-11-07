// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// withBravura.ts is the entry point for `vexflow-core-with-bravura.js`.
// This version includes only Bravura.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading other music fonts (e.g., Petaluma) on the fly.

import { loadMusicFonts } from '../fonts/bundleBravura';
import { loadTextFonts } from '../fonts/textfonts';
import { Vex } from '../index';

loadMusicFonts();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

console.log('entry/withBravura');

export * from '../index';
export default Vex;
