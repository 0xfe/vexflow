import { Font } from '../font.js';
import { CommonMetrics } from './common_metrics.js';
import { CustomFont } from './custom_glyphs.js';
export function loadCustom() {
    Font.load('Custom', CustomFont, CommonMetrics);
}
