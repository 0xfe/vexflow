import { Beam } from './beam';
import { Formatter } from './formatter';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { StaveTie } from './stavetie';
import { StemmableNote } from './stemmablenote';
import { TabTie } from './tabtie';
import { Voice } from './voice';
/** GraceNoteGroup is used to format and render grace notes. */
export declare class GraceNoteGroup extends Modifier {
    static DEBUG: boolean;
    static get CATEGORY(): string;
    protected readonly voice: Voice;
    protected readonly grace_notes: StemmableNote[];
    protected readonly show_slur?: boolean;
    protected preFormatted: boolean;
    protected formatter?: Formatter;
    render_options: {
        slur_y_shift: number;
    };
    protected slur?: StaveTie | TabTie;
    protected beams: Beam[];
    /** Arranges groups inside a `ModifierContext`. */
    static format(gracenote_groups: GraceNoteGroup[], state: ModifierContextState): boolean;
    constructor(grace_notes: StemmableNote[], show_slur?: boolean);
    preFormat(): void;
    beamNotes(grace_notes?: StemmableNote[]): this;
    setWidth(width: number): this;
    getWidth(): number;
    getGraceNotes(): Note[];
    draw(): void;
}
