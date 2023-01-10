import { Stave } from './stave';
import { LayoutMetrics, StaveModifier } from './stavemodifier';
export declare enum BarlineType {
    SINGLE = 1,
    DOUBLE = 2,
    END = 3,
    REPEAT_BEGIN = 4,
    REPEAT_END = 5,
    REPEAT_BOTH = 6,
    NONE = 7
}
export declare class Barline extends StaveModifier {
    static get CATEGORY(): string;
    protected widths: Record<string, number>;
    protected paddings: Record<string, number>;
    protected layoutMetricsMap: Record<number, LayoutMetrics>;
    protected thickness: number;
    protected type: BarlineType;
    static get type(): typeof BarlineType;
    static get typeString(): Record<string, BarlineType>;
    constructor(type: BarlineType | string);
    getType(): number;
    setType(type: string | number): this;
    draw(stave: Stave): void;
    drawVerticalBar(stave: Stave, x: number, double_bar?: boolean): void;
    drawVerticalEndBar(stave: Stave, x: number): void;
    drawRepeatBar(stave: Stave, x: number, begin: boolean): void;
}
