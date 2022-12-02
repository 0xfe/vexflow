import { FontInfo } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export declare enum VoltaType {
    NONE = 1,
    BEGIN = 2,
    MID = 3,
    END = 4,
    BEGIN_END = 5
}
export declare class Volta extends StaveModifier {
    static get CATEGORY(): string;
    static get type(): typeof VoltaType;
    static TEXT_FONT: Required<FontInfo>;
    protected volta: number;
    protected number: string;
    protected y_shift: number;
    constructor(type: number, number: string, x: number, y_shift: number);
    setShiftY(y: number): this;
    draw(stave: Stave, x: number): this;
}
