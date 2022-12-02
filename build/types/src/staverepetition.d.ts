import { FontInfo } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export declare class Repetition extends StaveModifier {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    static readonly type: {
        NONE: number;
        CODA_LEFT: number;
        CODA_RIGHT: number;
        SEGNO_LEFT: number;
        SEGNO_RIGHT: number;
        DC: number;
        DC_AL_CODA: number;
        DC_AL_FINE: number;
        DS: number;
        DS_AL_CODA: number;
        DS_AL_FINE: number;
        FINE: number;
        TO_CODA: number;
    };
    protected symbol_type: number;
    protected x_shift: number;
    protected y_shift: number;
    constructor(type: number, x: number, y_shift: number);
    setShiftX(x: number): this;
    setShiftY(y: number): this;
    draw(stave: Stave, x: number): this;
    drawCodaFixed(stave: Stave, x: number): this;
    drawSignoFixed(stave: Stave, x: number): this;
    drawSymbolText(stave: Stave, x: number, text: string, draw_coda: boolean): this;
}
