import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
export declare class Dot extends Modifier {
    static get CATEGORY(): string;
    protected radius: number;
    protected dot_shiftY: number;
    /** Returns the dots associated to a Note. */
    static getDots(note: Note): Dot[];
    /** Add a dot on the specified keys to the notes. */
    static buildAndAttach(notes: Note[], options?: {
        index?: number;
        all?: boolean;
    }): void;
    static format(dots: Dot[], state: ModifierContextState): boolean;
    constructor();
    setNote(note: Note): this;
    setDotShiftY(y: number): this;
    draw(): void;
}
