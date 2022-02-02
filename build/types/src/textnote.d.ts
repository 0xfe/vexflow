import { FontInfo } from './font';
import { Note, NoteStruct } from './note';
export declare enum Justification {
    LEFT = 1,
    CENTER = 2,
    RIGHT = 3
}
export interface TextNoteStruct extends NoteStruct {
    text?: string;
    glyph?: string;
    ignore_ticks?: boolean;
    smooth?: boolean;
    font?: FontInfo;
    subscript?: string;
    superscript?: string;
}
/**
 * `TextNote` is a notation element that is positioned in time. Generally
 * meant for objects that sit above/below the staff and inline with each other.
 * `TextNote` has to be assigned to a `Stave` before rendering by means of `setStave`.
 * Examples of this would be such as dynamics, lyrics, chord changes, etc.
 */
export declare class TextNote extends Note {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    static get Justification(): typeof Justification;
    /** Glyph data. */
    static get GLYPHS(): Record<string, {
        code: string;
    }>;
    protected text: string;
    protected superscript?: string;
    protected subscript?: string;
    protected smooth: boolean;
    protected justification: Justification;
    protected line: number;
    constructor(noteStruct: TextNoteStruct);
    /** Set the horizontal justification of the TextNote. */
    setJustification(just: Justification): this;
    /** Set the Stave line on which the note should be placed. */
    setLine(line: number): this;
    /** Pre-render formatting. */
    preFormat(): void;
    /**
     * Renders the TextNote.
     * `TextNote` has to be assigned to a `Stave` before rendering by means of `setStave`.
     */
    draw(): void;
}
