import { Glyph, GlyphProps } from './glyph';
import { Note, NoteStruct } from './note';
import { Stem, StemOptions } from './stem';
export declare abstract class StemmableNote extends Note {
    static get CATEGORY(): string;
    stem_direction?: number;
    stem?: Stem;
    protected flag?: Glyph;
    protected stem_extension_override?: number;
    constructor(noteStruct: NoteStruct);
    getStem(): Stem | undefined;
    checkStem(): Stem;
    setStem(stem: Stem): this;
    buildStem(): this;
    buildFlag(category?: string): void;
    getBaseCustomNoteHeadGlyphProps(): GlyphProps;
    getStemLength(): number;
    getBeamCount(): number;
    getStemMinimumLength(): number;
    getStemDirection(): number;
    setStemDirection(direction?: number): this;
    getStemX(): number;
    getCenterGlyphX(): number;
    getStemExtension(): number;
    setStemLength(height: number): this;
    getStemExtents(): {
        topY: number;
        baseY: number;
    };
    /** Gets the `y` value for the top modifiers at a specific `textLine`. */
    getYForTopText(textLine: number): number;
    /** Gets the `y` value for the bottom modifiers at a specific `textLine`. */
    getYForBottomText(textLine: number): number;
    hasFlag(): boolean;
    /** Post formats the note. */
    postFormat(): this;
    /** Renders the stem onto the canvas. */
    drawStem(stemOptions: StemOptions): void;
}
