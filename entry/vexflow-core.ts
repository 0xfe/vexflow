// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Engraving Fonts
//
// vexflow-core.ts is the entry point for output file vexflow-core.js.
// It will not load any music fonts by default.
// It also overrides the `Flow.setMusicFont(...)` function to be async,
// loading music fonts (e.g., Bravura, Petaluma, Gonville) on the fly.

import { Vex } from '../src/vex';

import { setupAsyncFontLoader } from '../src/fonts/async';
import { loadTextFonts } from '../src/fonts/textfonts';

// Do not preload / bundle any fonts.

// All music fonts will be loaded dynamically, when `Flow.setMusicFont(fontName)` is called.
setupAsyncFontLoader();

// Load the two text fonts that ChordSymbol & Annotation use.
loadTextFonts();

export * from '../src/index';
export default Vex;
