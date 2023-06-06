import { Font } from '../font.js';
import { CommonMetrics } from './common_metrics.js';
import { LelandFont } from './leland_glyphs.js';
export function loadLeland() {
    Font.load('Leland', LelandFont, CommonMetrics);
}
