// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// allFonts.ts is the entry point for the build output file: `vexflow.js`.
// It statically bundles all the music engraving fonts.

// TODO: RENAME THESE ENTRY FILES TO MATCH THE OUTPUT FILES???
// allFonts.ts => vexflow.ts
// withBravura.ts => vexflow-core-with-bravura.ts
// ... etc ...

import { loadMusicFonts } from '../fonts/bundleAll';
import { loadTextFonts } from '../fonts/textfonts';
import { Vex } from '../index';

loadMusicFonts();
loadTextFonts();

console.log('entry/allFonts');

export * from '../index';
export default Vex;
