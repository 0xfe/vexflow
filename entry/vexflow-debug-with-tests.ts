// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// vexflow-debug-with-tests.ts is the entry point for the build output file vexflow-debug-with-tests.js.
// It statically bundles all the music engraving fonts, and also includes the tests from vexflow/tests/.
// The output file is used by flow.html & flow-headless-browser.html to run the tests.

import * as VexSrc from '../src/index';
import * as VexTests from '../tests/index';

import { Flow } from '../src/flow';
import { loadAllMusicFonts } from '../src/fonts/load_all';
import { loadTextFonts } from '../src/fonts/textfonts';

loadAllMusicFonts();
Flow.setMusicFont('Bravura', 'Gonville', 'Custom');
loadTextFonts();

// Re-export all exports from src/index.ts and tests/index.ts.
export * from '../src/index';
export * from '../tests/index';
// Also collect all exports into a default export for CJS projects.
export default {
  ...VexSrc,
  ...VexTests,
};
