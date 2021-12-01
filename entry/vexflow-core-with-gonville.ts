// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-gonville.ts is the entry point for vexflow-core-with-gonville.js.
// This version bundles the Gonville music engraving font.
// It also overrides the `Flow.setMusicFont(...)` function to be async, which allows
// other music fonts (e.g., Bravura) to be loaded on the fly.

import { Vex } from './vexflow-core';

import { Flow } from '../src/flow';
import { Font } from '../src/font';
import { Gonville } from '../src/fonts/gonville';

Font.load('Gonville', Gonville.data, Gonville.metrics);
Flow.setMusicFont('Gonville');

export * from '../src/index';
export default Vex;
