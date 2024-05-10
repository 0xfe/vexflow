import { FontInfo } from './font';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';
export declare enum TextJustification {
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
    static readonly Justification: typeof TextJustification;
    /** Glyph data. */
    static get GLYPHS(): Record<string, {
        code: string;
    }>;
    protected text: string;
    protected glyph?: Glyph;
    protected superscript?: string;
    protected subscript?: string;
    protected smooth: boolean;
    protected justification: TextJustification;
    protected line: number;
    constructor(noteStruct: TextNoteStruct);
    /** Set the horizontal justification of the TextNote. */
    setJustification(just: TextJustification): this;
    /** Set the Stave line on which the note should be placed. */
    setLine(line: number): this;
    /** Return the Stave line on which the TextNote is placed. */
    getLine(): number;
    /** Return the unformatted text of this TextNote. */
    getText(): string;
    /** Pre-render formatting. */
    preFormat(): void;
    /**
     * Renders the TextNote.
     * `TextNote` has to be assigned to a `Stave` before rendering by means of `setStave`.
     */
    draw(): void;
}
