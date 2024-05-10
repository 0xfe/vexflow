import { Font } from '../font.js';
import { CommonMetrics } from './common_metrics.js';
import { GonvilleSmuflFont } from './gonville_glyphs.js';
export function loadGonville() {
    Font.load('Gonville', GonvilleSmuflFont, CommonMetrics);
}
