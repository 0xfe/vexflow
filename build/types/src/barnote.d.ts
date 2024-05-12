import { ModifierContext } from './modifiercontext';
import { Note } from './note';
import { Barline, BarlineType } from './stavebarline';
/**
 * A `BarNote` is used to render bar lines (from `barline.ts`). `BarNote`s can
 * be added to a voice and rendered in the middle of a stave. Since it has no
 * duration, it consumes no `tick`s, and is dealt with appropriately by the formatter.
 *
 * See `tests/barnote_tests.ts` for usage examples.
 */
export declare class BarNote extends Note {
    /** To enable logging for this class. Set `Vex.Flow.BarNote.DEBUG` to `true`. */
    static DEBUG: boolean;
    static get CATEGORY(): string;
    protected metrics: {
        widths: Record<string, number>;
    };
    protected type: BarlineType;
    barline: Barline;
    constructor(type?: string | BarlineType);
    /** Get the type of bar note.*/
    getType(): BarlineType;
    /** Set the type of bar note. */
    setType(type: string | BarlineType): this;
    addToModifierContext(mc: ModifierContext): this;
    /** Overridden to ignore. */
    preFormat(): this;
    /** Render note to stave. */
    draw(): void;
}
