import { FontInfo } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export interface StaveTempoOptions {
    bpm?: number;
    duration?: string;
    dots?: number;
    name?: string;
}
export declare class StaveTempo extends StaveModifier {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    protected tempo: StaveTempoOptions;
    protected shift_x: number;
    protected shift_y: number;
    /** Font size for note. */
    render_options: {
        glyph_font_scale: number;
    };
    constructor(tempo: StaveTempoOptions, x: number, shift_y: number);
    setTempo(tempo: StaveTempoOptions): this;
    setShiftX(x: number): this;
    setShiftY(y: number): this;
    draw(stave: Stave, shift_x: number): this;
}
