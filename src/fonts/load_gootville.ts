// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { GootvilleFont } from './gootville_glyphs';
import { GootvilleMetrics } from './gootville_metrics';

export function loadGootville() {
  Font.load('Gootville', GootvilleFont, GootvilleMetrics);
}
