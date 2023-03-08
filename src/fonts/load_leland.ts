// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { CommonMetrics } from './common_metrics';
import { LelandFont } from './leland_glyphs';

export function loadLeland() {
  Font.load('Leland', LelandFont, CommonMetrics);
}
