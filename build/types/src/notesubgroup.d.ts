import { Formatter } from './formatter';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Voice } from './voice';
export declare class NoteSubGroup extends Modifier {
    static get CATEGORY(): string;
    static format(groups: NoteSubGroup[], state: ModifierContextState): boolean;
    protected subNotes: Note[];
    protected preFormatted: boolean;
    protected formatter: Formatter;
    protected voice: Voice;
    constructor(subNotes: Note[]);
    preFormat(): void;
    setWidth(width: number): this;
    getWidth(): number;
    draw(): void;
}
