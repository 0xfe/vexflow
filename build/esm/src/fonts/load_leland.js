import { Font } from '../font.js';
import { LelandFont } from './leland_glyphs.js';
import { LelandMetrics } from './leland_metrics.js';
export function loadLeland() {
    Font.load('Leland', LelandFont, LelandMetrics);
}
