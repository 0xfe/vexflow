import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export interface ClefType {
    code: string;
    line: number;
}
export interface ClefAnnotatiomType extends ClefType {
    x_shift: number;
    point: number;
}
export interface ClefMetrics {
    width: number;
    annotations: {
        [key: string]: {
            [type: string]: {
                line?: number;
                shiftX?: number;
            } | number;
        };
    };
}
/**
 * Clef implements various types of clefs that can be rendered on a stave.
 *
 * See `tests/clef_tests.ts` for usage examples.
 */
export declare class Clef extends StaveModifier {
    /** To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`. */
    static DEBUG: boolean;
    static get CATEGORY(): string;
    annotation?: ClefAnnotatiomType;
    /**
     * The attribute `clef` must be a key from
     * `Clef.types`
     */
    clef: ClefType;
    protected attachment?: Glyph;
    protected size?: string;
    protected type?: string;
    /**
     * Every clef name is associated with a glyph code from the font file
     * and a default stave line number.
     */
    static get types(): Record<string, ClefType>;
    static get annotationSmufl(): Record<string, string>;
    /** Create a new clef. */
    constructor(type: string, size?: string, annotation?: string);
    /** Set clef type, size and annotation. */
    setType(type: string, size?: string, annotation?: string): this;
    /** Get clef width. */
    getWidth(): number;
    /** Get point for clefs. */
    static getPoint(size?: string): number;
    /** Set associated stave. */
    setStave(stave: Stave): this;
    /** Render clef. */
    draw(): void;
}
