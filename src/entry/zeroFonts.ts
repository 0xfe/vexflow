// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Engraving Fonts
//
// zeroFonts.ts is the entry point for `vexflow-core.js`.
// It will not load any music fonts by default.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading music fonts (e.g., Bravura, Petaluma, Gonville) on the fly.

import { Vex } from '../vex';

import { setupAsyncFontLoader } from '../fonts/async';
import { loadTextFonts } from '../fonts/textfonts';

// Do not preload / bundle any fonts.

// All music fonts will be loaded dynamically, when `Flow.setMusicFont(fontName)` is called.
setupAsyncFontLoader();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

console.log('VexFlow Core: No Fonts');

export default Vex;
