// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-gonville.ts is the entry point for vexflow-gonville.js.
// This version bundles the Gonville music engraving font.

import { Flow } from '../src/flow';
import { loadCustom } from '../src/fonts/load_custom';
import { loadGonville } from '../src/fonts/load_gonville';

loadGonville();
loadCustom();
Flow.setMusicFont('Gonville', 'Custom');

// Re-export all exports from index.ts.
export * from '../src/index';
// Also collect all exports into a default export for CJS projects.
export * as default from '../src/index';
