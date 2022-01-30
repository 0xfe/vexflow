import { Font } from '../font.js';
import { BravuraFont } from './bravura_glyphs.js';
import { BravuraMetrics } from './bravura_metrics.js';
export function loadBravura() {
    Font.load('Bravura', BravuraFont, BravuraMetrics);
}
