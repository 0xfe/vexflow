import { Glyph } from './glyph';
import { StaveModifier } from './stavemodifier';
export interface TimeSignatureInfo {
    glyph: Glyph;
    line?: number;
    num: boolean;
}
export declare class TimeSignature extends StaveModifier {
    static get CATEGORY(): string;
    static get glyphs(): Record<string, {
        code: string;
        point: number;
        line: number;
    }>;
    point: number;
    bottomLine: number;
    topLine: number;
    protected info: TimeSignatureInfo;
    protected validate_args: boolean;
    constructor(timeSpec?: string, customPadding?: number, validate_args?: boolean);
    parseTimeSpec(timeSpec: string): TimeSignatureInfo;
    makeTimeSignatureGlyph(topDigits: string, botDigits: string): Glyph;
    getInfo(): TimeSignatureInfo;
    setTimeSig(timeSpec: string): this;
    draw(): void;
}
