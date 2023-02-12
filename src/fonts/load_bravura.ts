// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

// If you are adding a new music engraving font, search for instances of ADD_MUSIC_FONT throughout the code base.
// To compile your new font into vexflow.js, take a look at src/fonts/load_all.ts
// You can export a font module which can be dynamically loaded by vexflow-core.js (see: Gruntfile.js).

// ADD_MUSIC_FONT
// To add a new music engraving font XXX, make a copy of this file and name it load_xxx.ts.
// Then you will need to generate xxx_glyphs.ts and xxx_metrics.ts.
// xxx_glyphs.ts is created by tools/fonts/fontgen_smufl.js
// xxx_metrics.ts is created by hand. You could copy bravura_metrics.ts and modify/remove/add entries where necessary.

import { Font } from '../font';
import { BravuraFont } from './bravura_glyphs';
import { CommonMetrics } from './common_metrics';

export function loadBravura() {
  Font.load('Bravura', BravuraFont, CommonMetrics);
}
