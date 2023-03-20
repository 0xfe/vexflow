// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { CommonMetrics } from './common_metrics';
import { GonvilleSmuflFont } from './gonville_glyphs';

export function loadGonville() {
  Font.load('Gonville', GonvilleSmuflFont, CommonMetrics);
}
