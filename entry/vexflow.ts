// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow.ts is the entry point for the build output file vexflow.js.
// It statically bundles all the music engraving fonts, and sets the music font stack to:
// Flow.setMusicFont('Bravura', 'Gonville', 'Custom');

// The webpack config inside Gruntfile.js sets the mode to 'production' to produce a minified build.

import { Flow } from '../src/flow';
import { loadAllMusicFonts } from '../src/fonts/load_all';
import { loadTextFonts } from '../src/fonts/textfonts';

loadAllMusicFonts();
Flow.setMusicFont('Bravura', 'Gonville', 'Custom');
loadTextFonts();

// Re-export all exports from index.ts.
export * from '../src/index';
// Also collect all exports into a default export for CJS projects.
export * as default from '../src/index';
