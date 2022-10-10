import { Font } from '../font.js';
import { PetalumaFont } from './petaluma_glyphs.js';
import { PetalumaMetrics } from './petaluma_metrics.js';
export function loadPetaluma() {
    Font.load('Petaluma', PetalumaFont, PetalumaMetrics);
}
