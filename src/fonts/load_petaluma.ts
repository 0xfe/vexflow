// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { CommonMetrics } from './common_metrics';
import { PetalumaFont } from './petaluma_glyphs';

export function loadPetaluma() {
  Font.load('Petaluma', PetalumaFont, CommonMetrics);
}
