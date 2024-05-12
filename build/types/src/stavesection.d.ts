import { FontInfo } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export declare class StaveSection extends StaveModifier {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    protected section: string;
    protected shift_x: number;
    protected shift_y: number;
    protected drawRect: boolean;
    constructor(section: string, x: number, shift_y: number, drawRect?: boolean);
    setStaveSection(section: string): this;
    setShiftX(x: number): this;
    setShiftY(y: number): this;
    draw(stave: Stave, shift_x: number): this;
}
