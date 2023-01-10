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
    /**
     * Runs setYShift() for the Glyph object so that it matches the position of line for
     * the Stave provided.  A `customShift` can also be given (measured in the same units
     * as `setYShift` not in lines) and this will be added after all other positions are
     * calculated from the Stave.
     *
     * Note that this routine only sets the yShift; it does not actually "place" (meaning
     * draw) the Glyph on the Stave.  Call .draw() afterwards to do that.
     */
    placeGlyphOnLine(glyph: Glyph, stave: Stave, line?: number, customShift?: number): void;
    getPadding(index: number): number;
    setPadding(padding: number): this;
    setLayoutMetrics(layoutMetrics: LayoutMetrics): this;
    getLayoutMetrics(): LayoutMetrics | undefined;
    draw(...args: any[]): void;
}
