// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

// [ADD_MUSIC_FONT]
// To add a new music engraving font XXX, make a copy of this file and name it load_xxx.ts.
// Then you will need to generate xxx_glyphs.ts and xxx_metrics.ts.
// xxx_glyphs.ts is created by tools/fonts/fontgen_smufl.js
// xxx_metrics.ts is created by hand. You could copy bravura_metrics.ts and modify/remove/add entries where necessary.

import { Font } from '../font';
import { BravuraFont } from './bravura_glyphs';
import { BravuraMetrics } from './bravura_metrics';

export function loadBravura() {
  Font.load('Bravura', BravuraFont, BravuraMetrics);
}
