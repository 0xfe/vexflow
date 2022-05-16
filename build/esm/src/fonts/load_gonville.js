import { Font } from '../font.js';
import { GonvilleFont } from './gonville_glyphs.js';
import { GonvilleMetrics } from './gonville_metrics.js';
export function loadGonville() {
    Font.load('Gonville', GonvilleFont, GonvilleMetrics);
}
