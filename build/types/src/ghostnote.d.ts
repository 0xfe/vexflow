import { ModifierContext } from './modifiercontext';
import { NoteStruct } from './note';
import { Stave } from './stave';
import { StemmableNote } from './stemmablenote';
export declare class GhostNote extends StemmableNote {
    static get CATEGORY(): string;
    constructor(parameter: string | NoteStruct);
    /**
     * @returns true if this note is a type of rest. Rests don't have pitches, but take up space in the score.
     */
    isRest(): boolean;
    setStave(stave: Stave): this;
    addToModifierContext(mc: ModifierContext): this;
    preFormat(): this;
    draw(): void;
}
