// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-bravura.ts is the entry point for vexflow-bravura.js.
// This version bundles the Bravura music engraving font.

import { Flow } from '../src/flow';
import { loadBravura } from '../src/fonts/load_bravura';
import { loadCustom } from '../src/fonts/load_custom';
import { loadTextFonts } from '../src/fonts/textfonts';

loadBravura();
loadCustom();
Flow.setMusicFont('Bravura', 'Custom');
loadTextFonts();

// Re-export all exports from index.ts.
export * from '../src/index';
// Also collect all exports into a default export for CJS projects.
export * as default from '../src/index';

// ADD_MUSIC_FONT
// To make a vexflow-xxx.js build that ONLY loads your new music font, copy this file and name it vexflow-xxx.ts.
// Replace these lines:
//     import { loadXXX } from '../src/fonts/load_xxx';
//     loadXXX();
//     Flow.setMusicFont('XXX', 'Custom');
// Feel free to remove references to Custom if you are not using those glyphs.
