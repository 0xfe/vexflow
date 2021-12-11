// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { BravuraFont } from './bravura_glyphs';
import { BravuraMetrics } from './bravura_metrics';

export function loadBravura() {
  Font.load('Bravura', BravuraFont, BravuraMetrics);
}
