import { FontInfo } from './font';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
export declare class Stroke extends Modifier {
    static get CATEGORY(): string;
    static readonly Type: {
        BRUSH_DOWN: number;
        BRUSH_UP: number;
        ROLL_DOWN: number;
        ROLL_UP: number;
        RASQUEDO_DOWN: number;
        RASQUEDO_UP: number;
        ARPEGGIO_DIRECTIONLESS: number;
    };
    static TEXT_FONT: Required<FontInfo>;
    static format(strokes: Stroke[], state: ModifierContextState): boolean;
    protected options: {
        all_voices: boolean;
    };
    protected all_voices: boolean;
    protected type: number;
    protected note_end?: Note;
    render_options: {
        font_scale: number;
    };
    constructor(type: number, options?: {
        all_voices: boolean;
    });
    getPosition(): number;
    addEndNote(note: Note): this;
    draw(): void;
}
