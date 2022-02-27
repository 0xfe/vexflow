import { Font } from '../font.js';
import { CustomFont } from './custom_glyphs.js';
import { CustomMetrics } from './custom_metrics.js';
export function loadCustom() {
    Font.load('Custom', CustomFont, CustomMetrics);
}
