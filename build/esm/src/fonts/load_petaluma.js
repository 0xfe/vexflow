import { Font } from '../font.js';
import { CommonMetrics } from './common_metrics.js';
import { PetalumaFont } from './petaluma_glyphs.js';
export function loadPetaluma() {
    Font.load('Petaluma', PetalumaFont, CommonMetrics);
}
