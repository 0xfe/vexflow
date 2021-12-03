// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-bravura.ts is the entry point for vexflow-core-with-bravura.js.
// This version bundles the Bravura music engraving font.
// It also overrides the `Flow.setMusicFont(...)` function to be async, which allows
// other music fonts (e.g., Petaluma) to be loaded on the fly.

import { Vex } from './vexflow-core';

import { Flow } from '../src/flow';
import { loadBravura } from '../src/fonts/load_bravura';

loadBravura();
Flow.setMusicFont('Bravura');

export * from '../src/index';
export default Vex;
