import { FontInfo } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export declare class StaveText extends StaveModifier {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    protected options: {
        shift_x: number;
        shift_y: number;
        justification: number;
    };
    protected text: string;
    protected shift_x?: number;
    protected shift_y?: number;
    constructor(text: string, position: number, options?: {
        shift_x?: number;
        shift_y?: number;
        justification?: number;
    });
    setStaveText(text: string): this;
    setShiftX(x: number): this;
    setShiftY(y: number): this;
    setText(text: string): this;
    draw(stave: Stave): this;
}
