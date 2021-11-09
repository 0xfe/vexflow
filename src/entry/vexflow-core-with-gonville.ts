// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-gonville.ts is the entry point for vexflow-core-with-gonville.js.
// This version includes only Gonville.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading other music fonts (e.g., Bravura) on the fly.

import { Vex } from '../';
import { loadMusicFonts } from '../fonts/bundleGonville';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

export * from '../';
export default Vex;
