// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-bravura.ts is the entry point for vexflow-core-with-bravura.js.
// This version includes only Bravura.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading other music fonts (e.g., Petaluma) on the fly.

import { Vex } from '../src/index';

import { loadMusicFonts } from '../src/fonts/bundleBravura';
import { loadTextFonts } from '../src/fonts/textfonts';

loadMusicFonts();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

export * from '../src/index';
export default Vex;
