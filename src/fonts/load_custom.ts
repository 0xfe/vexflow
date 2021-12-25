// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { CustomFont } from './custom_glyphs';
import { CustomMetrics } from './custom_metrics';

export function loadCustom() {
  Font.load('Custom', CustomFont, CustomMetrics);
}
