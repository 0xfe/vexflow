// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-debug.ts is the entry point for the build output file vexflow-debug.js.
// It statically bundles all the music engraving fonts.

// Currently, it is identical to vexflow.ts, but the webpack config inside Gruntfile.js
// sets the webpack mode to 'development' to produce an unminified build.

// In the future, we could do something different with this entry file, such as turn on flags for logging.

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
