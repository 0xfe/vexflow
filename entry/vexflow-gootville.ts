// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-gootville.ts is the entry point for vexflow-gootville.js.
// This version bundles the Gootville music engraving font.

import { Flow } from '../src/flow';
import { loadCustom } from '../src/fonts/load_custom';
import { loadGootville } from '../src/fonts/load_gootville';
import { loadTextFonts } from '../src/fonts/textfonts';

loadGootville();
loadCustom();
Flow.setMusicFont('Gootville', 'Custom');
loadTextFonts();

// Re-export all exports from index.ts.
export * from '../src/index';
// Also collect all exports into a default export for CJS projects.
export * as default from '../src/index';
