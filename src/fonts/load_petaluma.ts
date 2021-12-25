// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { PetalumaFont } from './petaluma_glyphs';
import { PetalumaMetrics } from './petaluma_metrics';

export function loadPetaluma() {
  Font.load('Petaluma', PetalumaFont, PetalumaMetrics);
}
