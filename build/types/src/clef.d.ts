import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
export interface ClefType {
    point: number;
    code: string;
    line?: number;
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
    annotation?: {
        code: string;
        line: number;
        x_shift: number;
        point: number;
    };
    /**
     * The attribute `clef` must be a key from
     * `Clef.types`
     */
    clef: ClefType;
    protected glyph?: Glyph;
    protected attachment?: Glyph;
    protected size?: string;
    protected type?: string;
    /**
     * Every clef name is associated with a glyph code from the font file
     * and a default stave line number.
     */
    static get types(): Record<string, ClefType>;
    /** Create a new clef. */
    constructor(type: string, size?: string, annotation?: string);
    /** Set clef type, size and annotation. */
    setType(type: string, size?: string, annotation?: string): this;
    /** Get clef width. */
    getWidth(): number;
    /** Set associated stave. */
    setStave(stave: Stave): this;
    /** Render clef. */
    draw(): void;
}
