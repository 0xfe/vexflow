import { Element } from './element';
import { Glyph } from './glyph';
import { Stave } from './stave';
export interface LayoutMetrics {
    xMin: number;
    xMax: number;
    paddingLeft: number;
    paddingRight: number;
}
export declare enum StaveModifierPosition {
    CENTER = 0,
    LEFT = 1,
    RIGHT = 2,
    ABOVE = 3,
    BELOW = 4,
    BEGIN = 5,
    END = 6
}
export declare class StaveModifier extends Element {
    static get CATEGORY(): string;
    static get Position(): typeof StaveModifierPosition;
    protected width: number;
    protected x: number;
    protected padding: number;
    protected position: StaveModifierPosition;
    protected stave?: Stave;
    protected layoutMetrics?: LayoutMetrics;
    constructor();
    getPosition(): number;
    setPosition(position: number): this;
    getStave(): Stave | undefined;
    checkStave(): Stave;
    setStave(stave: Stave): this;
    getWidth(): number;
    setWidth(width: number): this;
    getX(): number;
    setX(x: number): this;
    placeGlyphOnLine(glyph: Glyph, stave: Stave, line?: number, customShift?: number): void;
    getPadding(index: number): number;
    setPadding(padding: number): this;
    setLayoutMetrics(layoutMetrics: LayoutMetrics): this;
    getLayoutMetrics(): LayoutMetrics | undefined;
    draw(...args: any[]): void;
}
