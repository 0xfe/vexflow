// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { CommonMetrics } from './common_metrics';
import { CustomFont } from './custom_glyphs';

export function loadCustom() {
  Font.load('Custom', CustomFont, CommonMetrics);
}
