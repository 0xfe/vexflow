// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { LelandFont } from './leland_glyphs';
import { LelandMetrics } from './leland_metrics';

export function loadLeland() {
  Font.load('Leland', LelandFont, LelandMetrics);
}
