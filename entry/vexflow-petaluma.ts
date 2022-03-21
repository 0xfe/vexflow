// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-petaluma.ts is the entry point for vexflow-petaluma.js.
// This version bundles the Petaluma music engraving font.

import { Flow } from '../src/flow';
import { loadCustom } from '../src/fonts/load_custom';
import { loadPetaluma } from '../src/fonts/load_petaluma';
import { loadTextFonts } from '../src/fonts/textfonts';

loadPetaluma();
loadCustom();
Flow.setMusicFont('Petaluma', 'Custom');
loadTextFonts();

// Re-export all exports from index.ts.
export * from '../src/index';
// Also collect all exports into a default export for CJS projects.
export * as default from '../src/index';
