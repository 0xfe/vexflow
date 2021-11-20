// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-bravura.ts is the entry point for vexflow-core-with-bravura.js.
// This version bundles the Bravura music engraving font.
// It also overrides the `Flow.setMusicFont(...)` function to be async, which allows
// other music fonts (e.g., Petaluma) to be loaded on the fly.

import { Flow, Vex } from './vexflow-core';

import { Font } from '../src/font';
import { Bravura } from '../src/fonts/bravura';

Font.load('Bravura', Bravura.data, Bravura.metrics);
Flow.setMusicFont('Bravura');

export * from '../src/index';
export default Vex;
