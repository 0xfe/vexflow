import { Glyph } from './glyph';
import { Note } from './note';
import { TextNoteStruct } from './textnote';
/**
 * `TextDynamics` renders traditional
 * text dynamics markings, **ie: p, f, sfz, rfz, ppp**
 *
 * You can render any dynamics string that contains a combination of
 * the following letters:  P, M, F, Z, R, S
 */
export declare class TextDynamics extends Note {
    /** To enable logging for this class. Set `Vex.Flow.TextDynamics.DEBUG` to `true`. */
    static DEBUG: boolean;
    static get CATEGORY(): string;
    protected sequence: string;
    protected line: number;
    protected glyphs: Glyph[];
    /** The glyph data for each dynamics letter. */
    static get GLYPHS(): Record<string, {
        code: string;
        width: number;
    }>;
    /**
     * Create the dynamics marking.
     *
     * A `TextDynamics` object inherits from `Note` so that it can be formatted
     * within a `Voice`.
     *
     * @param noteStruct an object that contains a `duration` property and a
     * `sequence` of letters that represents the letters to render.
     */
    constructor(noteStruct: TextNoteStruct);
    /** Set the Stave line on which the note should be placed. */
    setLine(line: number): this;
    /** Preformat the dynamics text. */
    preFormat(): this;
    /** Draw the dynamics text on the rendering context. */
    draw(): void;
}
