import { Glyph, GlyphMetrics } from './glyph';
import { TimeSignature } from './timesignature';
export declare class TimeSignatureGlyph extends Glyph {
    timeSignature: TimeSignature;
    topStartX: number;
    botStartX: number;
    width: number;
    lineShift: number;
    xMin: number;
    constructor(timeSignature: TimeSignature, topDigits: string, botDigits: string, code: string, point: number, options?: {
        category: string;
    });
    getMetrics(): GlyphMetrics;
    renderToStave(x: number): void;
}
