// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

// This entry file will be exported as a font module that can be dynamically loaded by vexflow-core.js.
// Search for 'vexflow-font-bravura' in Gruntfile.js.

// ADD_MUSIC_FONT
// To add a new music engraving font named XXX, make a copy of this file and name it vexflow-font-xxx.ts.
// Then you will need to import the xxx_glyphs.ts and xxx_metrics.ts files.

import { BravuraFont } from '../src/fonts/bravura_glyphs';
import { CommonMetrics } from '../src/fonts/common_metrics';

export const Font = {
  data: BravuraFont,
  metrics: CommonMetrics,
};

export default Font;
