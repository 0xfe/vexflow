// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// withPetaluma.ts is the entry point for `vexflow-core-with-petaluma.js`.
// This version includes only Petaluma.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading other music fonts (e.g., Bravura) on the fly.

import Vex from '../vex';

import { loadMusicFonts } from '../fonts/bundlePetaluma';
import { loadTextFonts } from '../fonts/textfonts';

loadMusicFonts();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

export default Vex;
