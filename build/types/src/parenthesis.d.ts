import { Modifier, ModifierPosition } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
/** Parenthesis implements parenthesis modifiers for notes. */
export declare class Parenthesis extends Modifier {
    static get CATEGORY(): string;
    protected point: number;
    /** Add parentheses to the notes. */
    static buildAndAttach(notes: Note[]): void;
    /** Arrange parentheses inside a ModifierContext. */
    static format(parentheses: Parenthesis[], state: ModifierContextState): boolean;
    /**
     * Constructor
     *
     * @param position Modifier.Position.LEFT (default) or Modifier.Position.RIGHT
     */
    constructor(position: ModifierPosition);
    /** Set the associated note. */
    setNote(note: Note): this;
    /** Render the parenthesis. */
    draw(): void;
}
