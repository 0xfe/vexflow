// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-petaluma.ts is the entry point for vexflow-core-with-petaluma.js.
// This version includes only Petaluma.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading other music fonts (e.g., Bravura) on the fly.

import { Vex } from '../src/index';

import { loadMusicFonts } from '../src/fonts/bundlePetaluma';
import { loadTextFonts } from '../src/fonts/textfonts';

loadMusicFonts();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

export * from '../src/index';
export default Vex;
